from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class OrderCreate(BaseModel):
    business: str = Field(..., min_length=1, max_length=255, description="Tashkilot yoki korxona nomi")
    type: str = Field(..., min_length=1, max_length=100, description="Faoliyat turi (Masalan: Restoran, Do'kon, Qassobxona)")
    person: str = Field(..., min_length=1, max_length=255, description="Mas'ul shaxs ismi")
    phone: str = Field(..., min_length=7, max_length=50, description="Aloqa telefon raqami")
    volume: Optional[str] = Field(default="", max_length=255, description="Hajm / Miqdor")
    message: Optional[str] = Field(default="", max_length=1000, description="Qo'shimcha izoh")
    products: List[str] = Field(..., min_items=1, description="Tanlangan mahsulot ID lari")

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="Yangi holat (yangi, korildi, yetkazildi, bekor)")

class OrderOut(BaseModel):
    id: int
    created_at: datetime
    business: str
    business_type: str
    person: str
    phone: str
    volume: Optional[str] = ""
    message: Optional[str] = ""
    products: List[str]
    status: str
    telegram_message_id: Optional[int] = None
    telegram_pinned: bool = False

    class Config:
        from_attributes = True

class StatsOut(BaseModel):
    total_orders: int
    today_orders: int
    pending_orders: int
    completed_orders: int
    top_products: List[dict]
