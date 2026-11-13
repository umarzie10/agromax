import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, List
from config import settings
from models import Order

logger = logging.getLogger("telegram_service")

# Mahsulot nomlari lug'ati
PRODUCT_NAMES = {
    "egg-s": "🥚 Tuxum (kichik nav, C2)",
    "egg-m": "🥚 Tuxum (o'rta nav, C1)",
    "egg-l": "🥚 Tuxum (yirik nav, C0)",
    "chicken-whole": "🍗 Butun tovuq (vakuumda)",
    "chicken-breast": "🥩 Tovuq ko'krak go'shti (file)",
    "chicken-leg": "🍗 Tovuq soni va boldiri",
    "chicken-wing": "🍗 Tovuq qanoti (muzlatilgan)",
    "chicken-mince": "🥘 Tovuq qiymasi",
    "beef-tender": "🥩 Mol go'shti (lahm/antrekot)",
    "beef-soup": "🍖 Mol go'shti (sho'rvalik/suyakli)",
    "beef-ribs": "🥩 Mol qovurg'asi",
    "beef-mince": "🥘 Mol go'shti qiymasi",
    "qatiq": "🥛 Qatiq (tabiiy, fermadan)",
    "milk": "🥛 Yangi sog'ilgan sut",
    "cream": "🥣 Qaymoq (tabiiy ferma)",
}

# Telegram Stikerlar to'plami
STICKER_POOL = {
    "celebration": "CAACAgIAAxUAAWrMZMoPNudHzd9pyhaFlFy3pv9bAALgAAP0exkAASzrKFdeleMwPQQ",
    "chicken": "CAACAgIAAxUAAWrMZMo4Ax_R4X8jPsgXydoSuQRAAAL-AAP0exkAAaAWf7umYeLZPQQ",
    "beef": "CAACAgIAAxUAAWrMZMr4GgABD1PWCHf9Z91Nk5qMvgAC3gAD9HsZAAG9he9u98XOPT0E",
    "default": "CAACAgIAAxUAAWrMZMoPNudHzd9pyhaFlFy3pv9bAALgAAP0exkAASzrKFdeleMwPQQ",
}

def get_sticker_for_order(products: List[str]) -> str:
    """Buyurtma qilingan mahsulotlarga qarab eng mos stikerni tanlaydi"""
    prod_str = " ".join(products).lower()
    if any(k in prod_str for k in ["chicken", "tovuq"]):
        return STICKER_POOL["chicken"]
    if any(k in prod_str for k in ["beef", "mol"]):
        return STICKER_POOL["beef"]
    return STICKER_POOL["default"]

def format_order_message(order: Order) -> str:
    """Telegram uchun mukammal va jozibali HTML xabar shakllantiradi"""
    tashkent_tz = timezone(timedelta(hours=5))
    dt = order.created_at or datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    local_time = dt.astimezone(tashkent_tz).strftime("%d.%m.%Y, %H:%M")
    
    # Mahsulotlarni chiroyli ro'yxat qilish
    formatted_items = []
    for p_id in order.products:
        name = PRODUCT_NAMES.get(p_id, f"📦 {p_id}")
        formatted_items.append(f"  • {name}")
    products_text = "\n".join(formatted_items) if formatted_items else "  • <i>Belgilanmagan</i>"
    
    # HTML format
    lines = [
        "🌿 <b>YANGI ULGURJI BUYURTMA — AgroMax</b> 🌿",
        "━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"🆔 <b>Buyurtma raqami:</b> <code>#{order.id}</code>",
        f"📅 <b>Vaqti:</b> <i>{local_time}</i>",
        f"🚦 <b>Holat:</b> 🟡 <b>Yangi qabul qilindi</b>",
        "",
        f"🏢 <b>Korxona / Muassasa:</b> <b>{order.business}</b>",
        f"📋 <b>Faoliyat sohasi:</b> <code>{order.business_type}</code>",
        f"👤 <b>Mas'ul shaxs:</b> <b>{order.person}</b>",
        f"📞 <b>Telefon raqami:</b> <a href=\"tel:{order.phone}\"><b>{order.phone}</b></a>",
        "",
        "📦 <b>Buyurtma tarkibi:</b>",
        products_text,
        "",
    ]
    
    if order.volume:
        lines.append(f"⚖️ <b>Kerakli hajm/miqdor:</b> <b>{order.volume}</b>")
    if order.message:
        lines.append(f"💬 <b>Mijoz izohi:</b> <i>{order.message}</i>")
        
    lines.extend([
        "━━━━━━━━━━━━━━━━━━━━━━━━━",
        "📌 <i>Ushbu xabar avtomatik qadab (pin) qo'yildi</i>",
        "⚡️ <i>Mijoz bilan zudlik bilan bog'laning!</i>",
    ])
    
    return "\n".join(lines)

async def send_order_to_telegram(order: Order) -> Tuple[Optional[int], bool]:
    """
    Buyurtmani Telegram guruhiga yuboradi:
    1. Mavzuga mos stiker yuboriladi
    2. To'liq va chiroyli ma'lumot xabari yuboriladi
    3. XABAR AVTOMATIK PIN (QADAB) QO'YILADI
    """
    if not settings.BOT_TOKEN or not settings.CHAT_ID:
        logger.warning("BOT_TOKEN yoki CHAT_ID sozlanmagan. Telegramga xabar yuborilmadi.")
        return None, False

    base_url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}"
    message_id = None
    is_pinned = False

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Stiker yuborish
        if settings.SEND_STICKER_ENABLED:
            try:
                sticker_id = get_sticker_for_order(order.products or [])
                await client.post(
                    f"{base_url}/sendSticker",
                    json={
                        "chat_id": settings.CHAT_ID,
                        "sticker": sticker_id,
                    }
                )
            except Exception as e:
                logger.error(f"Stiker yuborishda xatolik: {e}")

        # 2. Asosiy xabarni yuborish
        try:
            text = format_order_message(order)
            resp = await client.post(
                f"{base_url}/sendMessage",
                json={
                    "chat_id": settings.CHAT_ID,
                    "text": text,
                    "parse_mode": "HTML",
                    "reply_markup": {
                        "inline_keyboard": [
                            [
                                {"text": f"📞 Qo'ng'iroq qilish ({order.phone})", "url": f"tel:{order.phone}"}
                            ]
                        ]
                    }
                }
            )
            data = resp.json()
            if data.get("ok"):
                message_id = data["result"]["message_id"]
                logger.info(f"Telegramga xabar muvaffaqiyatli yuborildi. Message ID: {message_id}")
            else:
                logger.error(f"Telegram sendMessage xatosi: {data}")
                return None, False
        except Exception as e:
            logger.error(f"Telegramga ulanishda xatolik: {e}")
            return None, False

        # 3. AVTOMATIK PIN (QADAB QO'YISH)
        if settings.AUTO_PIN_ENABLED and message_id:
            try:
                pin_resp = await client.post(
                    f"{base_url}/pinChatMessage",
                    json={
                        "chat_id": settings.CHAT_ID,
                        "message_id": message_id,
                        "disable_notification": False
                    }
                )
                pin_data = pin_resp.json()
                if pin_data.get("ok"):
                    is_pinned = True
                    logger.info(f"Message ID {message_id} muvaffaqiyatli PIN qilindi!")
                else:
                    logger.warning(f"Telegram pinChatMessage xatosi: {pin_data}")
            except Exception as e:
                logger.error(f"Telegram xabarni pin qilishda xatolik: {e}")

    return message_id, is_pinned

async def send_status_update_to_telegram(order: Order, old_status: str, new_status: str):
    """Buyurtma holati o'zgarganda telegram guruhiga yangilanish yuboradi"""
    if not settings.BOT_TOKEN or not settings.CHAT_ID or not order.telegram_message_id:
        return

    status_labels = {
        "yangi": "🟡 Yangi",
        "korildi": "🔵 Ko'rib chiqildi / Jarayonda",
        "yetkazildi": "🟢 Muvaffaqiyatli yetkazildi",
        "bekor": "🔴 Bekor qilindi",
    }
    
    text = (
        f"🔄 <b>Buyurtma #{order.id} holati yangilandi!</b>\n"
        f"Eski holat: {status_labels.get(old_status, old_status)}\n"
        f"Yangi holat: <b>{status_labels.get(new_status, new_status)}</b>\n"
        f"🏢 Korxona: <b>{order.business}</b>"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            await client.post(
                f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage",
                json={
                    "chat_id": settings.CHAT_ID,
                    "text": text,
                    "parse_mode": "HTML",
                    "reply_to_message_id": order.telegram_message_id
                }
            )
        except Exception as e:
            logger.error(f"Holat yangilanishini yuborishda xatolik: {e}")
