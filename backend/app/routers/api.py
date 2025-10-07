"""
Ultra-minimal API for Numbers Dictation - Audio Files Only
"""
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings

router = APIRouter(prefix="/api", tags=["audio"])


@router.get("/audio/{speed}/{number}")
async def get_audio_file(speed: str, number: int):
    """Get audio file for a specific number and speed"""
    if speed not in ["slow", "normal", "fast"]:
        raise HTTPException(status_code=400, detail="Invalid speed. Must be: slow, normal, or fast")

    if not (1 <= number <= 100):
        raise HTTPException(status_code=400, detail="Number must be between 1 and 100")

    filename = f"{number:03d}.mp3"

    # Docker-aware path resolution
    # In Docker container, files are mounted at /app/audio_files
    # For local development, use project root
    if os.path.exists(f"/app/{settings.audio_files_dir}"):
        audio_files_path = f"/app/{settings.audio_files_dir}"
    else:
        # Fallback for local development
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        audio_files_path = os.path.join(project_root, settings.audio_files_dir)

    file_path = os.path.join(audio_files_path, speed, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Audio file not found: {speed}/{filename}")

    return FileResponse(
        file_path,
        media_type="audio/mpeg",
        filename=filename
    )