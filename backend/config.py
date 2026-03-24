"""
Configuration settings for CuraCore backend
"""
import os
from typing import Literal

# AI Service Configuration
AI_SERVICE_MODE: Literal["full", "lite"] = os.getenv("AI_SERVICE_MODE", "lite")

# Database Configuration
DATABASE_PATH = os.getenv("DATABASE_PATH", "users.db")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]

# Model Configuration (for full AI service)
EMOTION_MODEL = "j-hartmann/emotion-english-distilroberta-base"
CHAT_MODEL = "microsoft/DialoGPT-medium"
CHAT_FALLBACK_MODEL = "gpt2"

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

def get_ai_service():
    """Factory function to get the appropriate AI service"""
    if AI_SERVICE_MODE == "full":
        try:
            from ai_service import AIService
            return AIService()
        except ImportError as e:
            print(f"Warning: Full AI service dependencies not available: {e}")
            print("Falling back to lite AI service...")
            from ai_service_lite import AIService
            return AIService()
    else:
        from ai_service_lite import AIService
        return AIService()

def print_config():
    """Print current configuration"""
    print("🤖 CuraCore Backend Configuration")
    print("=" * 40)
    print(f"AI Service Mode: {AI_SERVICE_MODE}")
    print(f"Database Path: {DATABASE_PATH}")
    print(f"API Host: {API_HOST}:{API_PORT}")
    print(f"Log Level: {LOG_LEVEL}")
    print("=" * 40)