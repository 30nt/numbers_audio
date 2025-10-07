"""
Скрипт для генерации всех аудио файлов немецких чисел 1-100
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.google_tts import GoogleTTSService


async def generate_all_numbers():
    """Generate audio for all numbers 1-100 in three speeds"""
    tts_service = GoogleTTSService()

    if not tts_service.is_available():
        print("❌ Google Cloud TTS недоступен. Проверьте настройки.")
        print("\n🔧 Для настройки:")
        print("1. Создайте Google Cloud проект")
        print("2. Включите Text-to-Speech API")
        print("3. Создайте service account и скачайте JSON ключ")
        print("4. Установите переменную GOOGLE_APPLICATION_CREDENTIALS в .env")
        return

    speeds = ['slow', 'normal', 'fast']
    numbers = range(1, 101)  # 1-100

    total_files = len(numbers) * len(speeds)
    current = 0

    print(f"🎯 Начинаем генерацию {total_files} аудио файлов...")
    print(f"📊 {len(numbers)} чисел × {len(speeds)} скорости = {total_files} файлов")

    for speed in speeds:
        print(f"\n🔊 Генерация файлов со скоростью: {speed}")

        for number in numbers:
            current += 1
            print(f"[{current:3d}/{total_files}] Генерируем {number:3d} ({speed})", end=" ")

            result = await tts_service.generate_number_audio(number, speed)
            if result:
                print("✅")
            else:
                print("❌")

    print(f"\n🎉 Генерация завершена! Создано {total_files} файлов.")
    print(f"📁 Файлы сохранены в папке: audio_files/")

    # Show directory structure
    print("\n📂 Структура папок:")
    for speed in speeds:
        speed_dir = os.path.join("audio_files", speed)
        if os.path.exists(speed_dir):
            file_count = len([f for f in os.listdir(speed_dir) if f.endswith('.mp3')])
            print(f"  └── {speed}/ ({file_count} файлов)")


if __name__ == "__main__":
    asyncio.run(generate_all_numbers())