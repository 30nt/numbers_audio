# German Numbers Dictation - Docker Setup

## Запуск с помощью Docker Compose

### Предварительные требования
- Docker
- Docker Compose
- Аудиофайлы должны быть сгенерированы в папке `audio_files/`

### Быстрый запуск

```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build
```

### Доступ к приложению
- **Фронтенд**: http://localhost
- **Бэкенд API**: http://localhost:8000
- **Документация API**: http://localhost:8000/docs

### Управление контейнерами

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Просмотр логов
docker-compose logs

# Просмотр логов конкретного сервиса
docker-compose logs frontend
docker-compose logs backend

# Перестройка конкретного сервиса
docker-compose build frontend
docker-compose build backend
```

### Структура сервисов

#### Backend
- **Контейнер**: `numbers-backend`
- **Порт**: 8000
- **Образ**: Python 3.11-slim + FastAPI

#### Frontend
- **Контейнер**: `numbers-frontend`
- **Порт**: 80
- **Образ**: Node.js 18 (build) + Nginx (runtime)

### Volumes
- `./audio_files` - примонтирован read-only к бэкенду для доступа к аудиофайлам

### Сеть
- Внутренняя сеть `numbers-network` для связи между сервисами
- Nginx проксирует API запросы на бэкенд

### Отладка

```bash
# Подключение к контейнеру бэкенда
docker-compose exec backend bash

# Подключение к контейнеру фронтенда
docker-compose exec frontend sh

# Проверка состояния сервисов
docker-compose ps

# Проверка использования ресурсов
docker-compose top
```