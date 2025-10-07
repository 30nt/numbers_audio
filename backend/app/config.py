"""
Application configuration settings loaded from environment variables.
"""
import os
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application configuration for Numbers Dictation project.

    Environment variables are loaded from .env file and system environment.
    """

    # Google Cloud TTS
    google_application_credentials: Optional[str] = None
    google_tts_language_code: str = "de-DE"
    google_tts_voice_name: str = "de-DE-Standard-A"

    # Скорости произношения
    google_tts_slow_speed: float = 0.7
    google_tts_normal_speed: float = 1.0
    google_tts_fast_speed: float = 1.3

    # Пути для аудио файлов
    audio_files_dir: str = "audio_files"

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        env_file_encoding = 'utf-8'
        case_sensitive = False


settings = Settings()