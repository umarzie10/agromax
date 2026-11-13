from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

from database import get_db
from models import Order
from schemas import StatsOut

router = APIRouter(prefix="/api/stats", tags=["Statistics"])

@router.get("", response_model=StatsOut)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Tizim bo'yicha umumiy statistik ma'lumotlar"""
    # Jami buyurtmalar
    total_res = await db.execute(select(func.count(Order.id)))
    total_orders = total_res.scalar_one() or 0
    
    # Bugungi buyurtmalar (Toshkent vaqti)
    now_utc = datetime.now(timezone.utc)
    today_start = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    today_res = await db.execute(select(func.count(Order.id)).where(Order.created_at >= today_start))
    today_orders = today_res.scalar_one() or 0
    
    # Yangi (kutilayotgan) buyurtmalar
    pending_res = await db.execute(select(func.count(Order.id)).where(Order.status == "yangi"))
    pending_orders = pending_res.scalar_one() or 0
    
    # Yetkazilgan buyurtmalar
    completed_res = await db.execute(select(func.count(Order.id)).where(Order.status == "yetkazildi"))
    completed_orders = completed_res.scalar_one() or 0
    
    # Eng ko'p so'ralgan mahsulotlar statistikasi
    all_orders = await db.execute(select(Order.products))
    product_counts: Dict[str, int] = {}
    for (prods,) in all_orders.all():
        if isinstance(prods, list):
            for p in prods:
                product_counts[p] = product_counts.get(p, 0) + 1
                
    top_products = [
        {"product_id": p, "count": c}
        for p, c in sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    return {
        "total_orders": total_orders,
        "today_orders": today_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "top_products": top_products
    }
