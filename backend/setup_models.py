#!/usr/bin/env python3
"""
Setup script to download and cache pretrained models
Run this script once to download models before starting the server
"""

import os
import sys

# Check if AI dependencies are available
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    AI_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  AI dependencies not available: {e}")
    print("💡 Run 'python install.py' to install dependencies")
    AI_AVAILABLE = False

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_models():
    """Download and cache all required models"""
    
    if not AI_AVAILABLE:
        print("❌ Cannot download models: AI dependencies not installed")
        print("💡 Run 'python install.py' first to install dependencies")
        return False
    
    logger.info("Starting model download process...")
    
    # Create models directory
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    
    try:
        # 1. Download emotion classification model
        logger.info("Downloading emotion classification model...")
        emotion_model_name = "j-hartmann/emotion-english-distilroberta-base"
        
        emotion_tokenizer = AutoTokenizer.from_pretrained(
            emotion_model_name,
            cache_dir=f"{models_dir}/emotion"
        )
        emotion_model = AutoModelForSequenceClassification.from_pretrained(
            emotion_model_name,
            cache_dir=f"{models_dir}/emotion"
        )
        
        logger.info("✓ Emotion model downloaded successfully")
        
        # 2. Download conversational model
        logger.info("Downloading conversational model...")
        
        # Try DialoGPT first
        try:
            chat_pipeline = pipeline(
                "text-generation",
                model="microsoft/DialoGPT-medium",
                tokenizer="microsoft/DialoGPT-medium",
                cache_dir=f"{models_dir}/chat"
            )
            logger.info("✓ DialoGPT model downloaded successfully")
        except Exception as e:
            logger.warning(f"DialoGPT download failed: {e}")
            logger.info("Downloading GPT-2 as fallback...")
            
            chat_pipeline = pipeline(
                "text-generation",
                model="gpt2",
                cache_dir=f"{models_dir}/chat_fallback"
            )
            logger.info("✓ GPT-2 fallback model downloaded successfully")
        
        # 3. Test the models
        logger.info("Testing models...")
        
        # Test emotion detection
        test_text = "I am feeling really happy today!"
        inputs = emotion_tokenizer(test_text, return_tensors="pt", truncation=True, padding=True)
        
        with torch.no_grad():
            outputs = emotion_model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        logger.info("✓ Emotion model test passed")
        
        # Test chat generation
        test_response = chat_pipeline("Hello, how are you?", max_length=50, num_return_sequences=1)
        logger.info("✓ Chat model test passed")
        
        logger.info("🎉 All models downloaded and tested successfully!")
        logger.info("You can now start the server with: python start.py")
        
    except Exception as e:
        logger.error(f"❌ Error downloading models: {e}")
        logger.error("Please check your internet connection and try again.")
        return False
    
    return True

if __name__ == "__main__":
    print("🤖 CuraCore AI Models Setup")
    print("=" * 40)
    
    # Check if CUDA is available
    if torch.cuda.is_available():
        print(f"✓ CUDA available: {torch.cuda.get_device_name()}")
    else:
        print("ℹ️  CUDA not available, using CPU")
    
    print("\nDownloading pretrained models...")
    print("This may take a few minutes on first run...\n")
    
    success = download_models()
    
    if success:
        print("\n🚀 Setup complete! Your AI chatbot is ready to use.")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")