#!/usr/bin/env python3
"""
Installation script for CuraCore Backend
Helps users choose between lite and full AI service
"""

import os
import sys
import subprocess
import platform

def print_banner():
    print("🤖 CuraCore Backend Installation")
    print("=" * 50)
    print("Choose your AI service configuration:")
    print()

def install_basic_requirements():
    """Install basic requirements for the backend"""
    print("📦 Installing basic requirements...")
    
    basic_requirements = [
        "fastapi==0.104.1",
        "uvicorn==0.24.0", 
        "bcrypt==4.1.2",
        "python-jose[cryptography]==3.3.0",
        "python-multipart==0.0.6",
        "pydantic>=2.8.2",
        "email-validator==2.1.0",
        "python-dotenv==1.0.0"
    ]
    
    for req in basic_requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", req])
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {req}: {e}")
            return False
    
    print("✅ Basic requirements installed successfully!")
    return True

def install_ai_requirements():
    """Install AI/ML requirements for full service"""
    print("🧠 Installing AI/ML requirements...")
    print("⚠️  This may take several minutes and requires ~2GB of disk space")
    
    ai_requirements = [
        "torch>=2.2.0",
        "transformers==4.44.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "sentence-transformers>=2.2.0"
    ]
    
    for req in ai_requirements:
        try:
            print(f"Installing {req}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", req])
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {req}: {e}")
            return False
    
    print("✅ AI requirements installed successfully!")
    return True

def download_models():
    """Download pretrained models"""
    print("📥 Downloading pretrained models...")
    try:
        subprocess.check_call([sys.executable, "setup_models.py"])
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to download models: {e}")
        return False

def create_env_file(mode):
    """Create environment configuration file"""
    env_content = f"""# CuraCore Backend Configuration
AI_SERVICE_MODE={mode}
DATABASE_PATH=users.db
SECRET_KEY=your-secret-key-change-this-in-production-{os.urandom(8).hex()}
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000
"""
    
    with open(".env", "w") as f:
        f.write(env_content)
    
    print(f"✅ Configuration file created (.env) with AI_SERVICE_MODE={mode}")

def main():
    print_banner()
    
    print("1. 🚀 Lite Mode (Recommended for quick start)")
    print("   - Fast installation (~30 seconds)")
    print("   - Keyword-based emotion detection")
    print("   - Rule-based chat responses")
    print("   - Small memory footprint")
    print()
    
    print("2. 🧠 Full AI Mode (Advanced)")
    print("   - Longer installation (~10-15 minutes)")
    print("   - Pretrained emotion detection models")
    print("   - AI-generated chat responses")
    print("   - Requires ~2GB disk space")
    print()
    
    while True:
        choice = input("Choose installation mode (1 for Lite, 2 for Full): ").strip()
        
        if choice == "1":
            mode = "lite"
            break
        elif choice == "2":
            mode = "full"
            break
        else:
            print("❌ Please enter 1 or 2")
    
    print(f"\n🔧 Installing CuraCore Backend in {mode.upper()} mode...")
    
    # Install basic requirements
    if not install_basic_requirements():
        print("❌ Installation failed!")
        return False
    
    # Install AI requirements if full mode
    if mode == "full":
        if not install_ai_requirements():
            print("⚠️  AI installation failed, falling back to lite mode...")
            mode = "lite"
        else:
            # Download models
            if not download_models():
                print("⚠️  Model download failed, falling back to lite mode...")
                mode = "lite"
    
    # Create configuration
    create_env_file(mode)
    
    print("\n🎉 Installation completed successfully!")
    print(f"✅ AI Service Mode: {mode.upper()}")
    print()
    print("🚀 To start the server:")
    print("   python start.py")
    print()
    print("📚 API Documentation will be available at:")
    print("   http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)