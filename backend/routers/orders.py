from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import logging

from database import get_db
from models import Order
from schemas import OrderCreate, OrderOut, OrderStatusUpdate
from telegram_service import send_order_to_telegram, send_status_update_to_telegram

router = APIRouter(prefix="/api/orders", tags=["Orders"])
logger = logging.getLogger("orders_router")

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Yangi buyurtma qabul qilish:
    1. Ma'lumotlar bazasiga xavfsiz saqlash
    2. Telegram bot orqali guruhga stiker va ma'lumot xabari yuborish
    3. Xabarni avtomatik ravishda PIN qilib qadab qo'yish
    """
    try:
        client_ip = request.client.host if request.client else None
        
        # 1. Bazaga yangi buyurtma yaratish
        new_order = Order(
            business=payload.business,
            business_type=payload.type,
            person=payload.person,
            phone=payload.phone,
            volume=payload.volume or "",
            message=payload.message or "",
            products=payload.products,
            status="yangi",
            ip_address=client_ip
        )
        db.add(new_order)
        await db.commit()
        await db.refresh(new_order)
        
        # 2. Telegram integratsiyasi (Stiker + Xabar + Auto-Pin)
        msg_id, pinned = await send_order_to_telegram(new_order)
        
        if msg_id:
            new_order.telegram_message_id = msg_id
            new_order.telegram_pinned = pinned
            await db.commit()
            await db.refresh(new_order)
            
        return {
            "ok": True,
            "message": "Buyurtmangiz muvaffaqiyatli qabul qilindi!",
            "order_id": new_order.id,
            "telegram_sent": bool(msg_id),
            "telegram_pinned": pinned
        }
    except Exception as e:
        logger.error(f"Buyurtma yaratishda kutilmagan xatolik: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Buyurtmani saqlashda tizim xatoligi yuz berdi"
        )

# Frontend "/api/order" (singular) chaqiruvlari uchun ham qulay marshrut
order_alias_router = APIRouter(prefix="/api/order", tags=["Order Single Alias"])

@order_alias_router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_order_alias(
    payload: OrderCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    return await create_order(payload, request, db)

@router.get("", response_model=List[OrderOut])
async def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Barcha buyurtmalar ro'yxatini olish (Admin uchun)"""
    stmt = select(Order).order_by(desc(Order.created_at))
    if status_filter:
        stmt = stmt.where(Order.status == status_filter)
    stmt = stmt.offset(offset).limit(limit)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Bitta buyurtma tafsilotlarini olish"""
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    return order

@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Buyurtma holatini yangilash (yangi -> korildi -> yetkazildi -> bekor)"""
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
        
    old_status = order.status
    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    
    # Telegramga xabar berish
    await send_status_update_to_telegram(order, old_status, payload.status)
    return order

@router.delete("/{order_id}", response_model=dict)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Buyurtmani o'chirish"""
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    await db.delete(order)
    await db.commit()
    return {"ok": True, "message": f"Buyurtma #{order_id} o'chirildi"}
