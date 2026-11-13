import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AgroMax Backend API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Telegram Bot
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "8980149764:AAFM3ljn83TuurTwB9CgF-9SLQbRUdo0GTU")
    CHAT_ID: str = os.getenv("CHAT_ID", "-1004349938020")
    AUTO_PIN_ENABLED: bool = True
    SEND_STICKER_ENABLED: bool = True
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agromax.db")
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "agromax2026")
    ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "agromax-secret-2026")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
