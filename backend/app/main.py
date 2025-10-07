"""
FastAPI main application for Numbers Dictation
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import logging
import time

from app.routers import api
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Numbers Dictation API",
    description="API for German numbers dictation learning application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )

    return response


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error_code": "INTERNAL_ERROR"}
    )


# Include API routers
app.include_router(api.router)


# Static files for audio (optional alternative serving method)
# In Docker container, files are mounted at /app/audio_files
# For local development, use project root
if os.path.exists(f"/app/{settings.audio_files_dir}"):
    audio_files_path = f"/app/{settings.audio_files_dir}"
else:
    # Fallback for local development
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    audio_files_path = os.path.join(project_root, settings.audio_files_dir)

if os.path.exists(audio_files_path):
    app.mount("/static/audio", StaticFiles(directory=audio_files_path), name="audio")
    logger.info(f"Mounted static audio files from: {audio_files_path}")
else:
    logger.warning(f"Audio files directory not found: {audio_files_path}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Numbers Dictation API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "numbers-dictation-api",
        "version": "1.0.0"
    }


# Run with uvicorn if called directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )