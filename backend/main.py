import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import init_db
from routers.orders import router as orders_router, order_alias_router
from routers.stats import router as stats_router
from routers.auth import router as auth_router

# Logging sozlash
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("agromax_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Server ishga tushganda ma'lumotlar bazasini initsializatsiya qilish
    logger.info("AgroMax beton backend ishga tushmoqda...")
    await init_db()
    logger.info("Ma'lumotlar bazasi jadvallari tayyor!")
    yield
    logger.info("AgroMax backend to'xtatildi.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AgroMax ulgurji savdo platformasi uchun yuqori unumdorli Python FastAPI backend",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS — barcha domenlar va frontend uchun ruxsat
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global xatoliklarni ushlash
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global server xatosi: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"ok": False, "detail": "Ichki server xatoligi yuz berdi"}
    )

# Marshrutlarni ulash
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(order_alias_router)
app.include_router(stats_router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "bot_configured": bool(settings.BOT_TOKEN and settings.CHAT_ID),
        "auto_pin": settings.AUTO_PIN_ENABLED,
        "stickers": settings.SEND_STICKER_ENABLED
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
