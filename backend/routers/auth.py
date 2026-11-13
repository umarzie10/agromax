from fastapi import APIRouter, HTTPException, Depends, Header, status
from pydantic import BaseModel
from typing import Optional
from config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    ok: bool
    token: str
    username: str
    role: str = "admin"

def verify_admin(authorization: Optional[str] = Header(None)) -> bool:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentifikatsiya talab qilinadi"
        )
    token = authorization.replace("Bearer ", "").strip()
    if token != settings.ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yaroqsiz yoki eskirgan sessiya kaliti"
        )
    return True

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    """Admin yoki operator tizimga kirishi"""
    if payload.username.strip() == settings.ADMIN_USERNAME and payload.password.strip() == settings.ADMIN_PASSWORD:
        return LoginResponse(
            ok=True,
            token=settings.ADMIN_SECRET_KEY,
            username=settings.ADMIN_USERNAME,
            role="admin"
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Login yoki parol noto'g'ri kiritildi"
    )

@router.get("/verify")
async def verify(authorized: bool = Depends(verify_admin)):
    """Tokenning haqiqiyligini tekshirish"""
    return {"ok": True, "authenticated": True, "role": "admin"}
