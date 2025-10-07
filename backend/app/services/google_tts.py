"""
Google Cloud Text-to-Speech service для генерации немецких чисел
"""
import os
import asyncio
from typing import Optional
from google.cloud import texttospeech
from app.config import settings


class GoogleTTSService:
    """
    Сервис для генерации аудио немецких чисел через Google Cloud TTS
    """

    def __init__(self):
        """
        Initialize Google TTS service
        """
        self.client = None
        self._init_client()

    def _init_client(self):
        """
        Initialize Google Cloud TTS client if credentials are available
        """
        try:
            if settings.google_application_credentials and os.path.exists(settings.google_application_credentials):
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.google_application_credentials
                self.client = texttospeech.TextToSpeechClient()
                print("Google Cloud TTS client initialized successfully")
            else:
                print("Google Cloud TTS credentials not found, client not initialized")
        except Exception as e:
            print(f"Failed to initialize Google Cloud TTS client: {str(e)}")
            self.client = None

    def is_available(self) -> bool:
        """
        Check if Google Cloud TTS is available

        Returns:
            True if client is initialized, False otherwise
        """
        return self.client is not None

    async def generate_number_audio(self, number: int, speed: str) -> Optional[str]:
        """
        Generate audio file from German number using Google Cloud TTS

        Args:
            number: Number from 1 to 100
            speed: Speed ('slow', 'normal', 'fast')

        Returns:
            Path to generated audio file or None if error
        """
        if not self.is_available():
            print("Google Cloud TTS is not available")
            return None

        try:
            # German text for the number
            german_text = self._get_german_number(number)

            # Speaking rate
            speaking_rate = self._get_speaking_rate(speed)

            # File path - ensure we use project root directory
            filename = f"{number:03d}.mp3"

            # Get project root directory (go up from backend/app/services to project root)
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            output_dir = os.path.join(project_root, settings.audio_files_dir, speed)
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, filename)

            # Generate in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                self._generate_speech,
                german_text,
                output_path,
                speaking_rate
            )

            print(f"Audio generated successfully: {output_path}")
            return output_path

        except Exception as e:
            print(f"Error generating audio for {number}: {str(e)}")
            return None

    def _generate_speech(self, text: str, output_path: str, speaking_rate: float):
        """
        Synchronous method to generate speech with Google Cloud TTS

        Args:
            text: Text to convert
            output_path: Path where to save the audio file
            speaking_rate: Speed of speech
        """
        # Set the text input to be synthesized
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # Build the voice request
        voice = texttospeech.VoiceSelectionParams(
            language_code=settings.google_tts_language_code,
            name=settings.google_tts_voice_name,
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )

        # Select the type of audio file
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=speaking_rate
        )

        # Perform the text-to-speech request
        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # Write the response to the output file
        with open(output_path, "wb") as out:
            out.write(response.audio_content)

    def _get_speaking_rate(self, speed: str) -> float:
        """
        Get speaking rate for speed setting

        Args:
            speed: Speed setting ('slow', 'normal', 'fast')

        Returns:
            Speaking rate as float
        """
        speed_map = {
            'slow': settings.google_tts_slow_speed,
            'normal': settings.google_tts_normal_speed,
            'fast': settings.google_tts_fast_speed
        }
        return speed_map.get(speed, 1.0)

    def _get_german_number(self, number: int) -> str:
        """
        Convert number to German text

        Args:
            number: Number from 1 to 100

        Returns:
            German text representation of the number
        """
        # Dictionary of German numbers 1-20
        ones_names = {
            1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf",
            6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 10: "zehn",
            11: "elf", 12: "zwölf", 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn",
            16: "sechzehn", 17: "siebzehn", 18: "achtzehn", 19: "neunzehn", 20: "zwanzig"
        }

        # Dictionary of tens
        tens_names = {
            2: "zwanzig", 3: "dreißig", 4: "vierzig", 5: "fünfzig",
            6: "sechzig", 7: "siebzig", 8: "achtzig", 9: "neunzig"
        }

        if number <= 20:
            return ones_names[number]
        elif number < 100:
            ones = number % 10
            tens = number // 10
            if ones == 0:
                return tens_names[tens]
            else:
                return f"{ones_names[ones]}und{tens_names[tens]}"
        elif number == 100:
            return "hundert"

        return str(number)