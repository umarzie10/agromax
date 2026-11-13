import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    
    business = Column(String(255), nullable=False)
    business_type = Column(String(100), nullable=False)
    person = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False, index=True)
    volume = Column(String(255), nullable=True, default="")
    message = Column(Text, nullable=True, default="")
    products = Column(JSON, nullable=False, default=list)
    
    status = Column(String(50), nullable=False, default="yangi", index=True) # yangi, korildi, yetkazildi, bekor
    
    # Telegram tracking
    telegram_message_id = Column(Integer, nullable=True)
    telegram_pinned = Column(Boolean, default=False)
    
    # Audit
    ip_address = Column(String(50), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "business": self.business,
            "business_type": self.business_type,
            "person": self.person,
            "phone": self.phone,
            "volume": self.volume,
            "message": self.message,
            "products": self.products,
            "status": self.status,
            "telegram_message_id": self.telegram_message_id,
            "telegram_pinned": self.telegram_pinned,
        }

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    phone = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    business = Column(String(255), nullable=True, default="")
    business_type = Column(String(100), nullable=True, default="")
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="client")

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "phone": self.phone,
            "email": self.email,
            "full_name": self.full_name,
            "business": self.business,
            "business_type": self.business_type,
            "role": self.role,
        }

