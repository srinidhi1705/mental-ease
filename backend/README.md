# CuraCore Backend

AI-powered backend with emotion detection and conversational AI for CuraCore application.

## Features

- **Pretrained AI Models**: Uses Hugging Face transformers for emotion detection and chat responses
- **Emotion Analysis**: Real-time emotion detection from user messages
- **Conversational AI**: Context-aware responses using DialoGPT/GPT-2
- **SQLite Database**: Stores conversations, emotions, and mood data
- **JWT Authentication**: Secure user authentication

## Quick Start

### Option 1: Interactive Installation (Recommended)

```bash
python install.py
```

This interactive installer guides you through choosing between:

- **Lite Mode**: Fast setup with keyword-based AI (30 seconds)
- **Full Mode**: Advanced AI with pretrained models (10-15 minutes)

### Option 2: Manual Installation

**Lite Mode** (keyword-based AI):

```bash
pip install fastapi uvicorn bcrypt python-jose[cryptography] python-multipart pydantic email-validator python-dotenv
echo "AI_SERVICE_MODE=lite" > .env
python start.py
```

**Full Mode** (pretrained AI models):

```bash
pip install -r requirements.txt
python setup_models.py
echo "AI_SERVICE_MODE=full" > .env
python start.py
```

### Starting the Server

```bash
python start.py
```

The server automatically detects your configuration and starts in the appropriate mode.

## Installation Modes

- **Full Mode**: Uses pretrained transformers for emotion detection and chat
- **Lite Mode**: Uses keyword-based emotion detection (no heavy dependencies)
- **Auto-Fallback**: Automatically switches to lite mode if AI dependencies fail

## AI Models Used

- **Emotion Detection**: `j-hartmann/emotion-english-distilroberta-base`
  - Detects: anger, disgust, fear, joy, neutral, sadness, surprise
- **Conversational AI**: `microsoft/DialoGPT-medium` (fallback: `gpt2`)
  - Generates contextual responses to user messages

## API Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info (requires authentication)
- `GET /` - Health check

## Database

The application uses SQLite database (`users.db`) with the following schema:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    streak INTEGER DEFAULT 0,
    badges TEXT DEFAULT '[]',
    join_date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is configured for React frontend (localhost:3000)

## Environment

Make sure to change the `SECRET_KEY` in `auth.py` for production use.
