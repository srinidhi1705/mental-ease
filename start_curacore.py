#!/usr/bin/env python3
"""
Complete startup script for CuraCore application
Checks dependencies, starts backend, and provides frontend instructions
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

def print_banner():
    print("🤖 MentalEase Application Startup")
    print("=" * 50)

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} detected")
        print("   CuraCore requires Python 3.8 or higher")
        return False
    
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_backend_setup():
    """Check if backend is properly set up"""
    backend_path = Path("backend")
    
    if not backend_path.exists():
        print("❌ Backend folder not found")
        return False
    
    requirements_file = backend_path / "requirements.txt"
    if not requirements_file.exists():
        print("❌ Backend requirements.txt not found")
        return False
    
    print("✅ Backend folder structure")
    return True

def check_frontend_setup():
    """Check if frontend is properly set up"""
    package_json = Path("package.json")
    node_modules = Path("node_modules")
    
    if not package_json.exists():
        print("❌ Frontend package.json not found")
        return False
    
    if not node_modules.exists():
        print("⚠️  Node modules not installed")
        print("   Run: npm install")
        return False
    
    print("✅ Frontend setup")
    return True

def install_backend_dependencies():
    """Install backend dependencies"""
    print("📦 Installing backend dependencies...")
    
    try:
        os.chdir("backend")
        
        # Check if install.py exists and run it
        if Path("install.py").exists():
            print("🔧 Running guided installation...")
            # Run install.py with lite mode (option 1)
            process = subprocess.Popen(
                [sys.executable, "install.py"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input="1\n")  # Choose lite mode
            
            if process.returncode == 0:
                print("✅ Backend dependencies installed")
                return True
            else:
                print(f"❌ Installation failed: {stderr}")
                return False
        else:
            # Fallback to pip install
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Backend dependencies installed")
            return True
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        os.chdir("..")

def start_backend_server():
    """Start the backend server in a separate thread"""
    def run_server():
        try:
            os.chdir("backend")
            subprocess.run([sys.executable, "start.py"])
        except Exception as e:
            print(f"❌ Backend server error: {e}")
        finally:
            os.chdir("..")
    
    print("🚀 Starting backend server...")
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait a moment for server to start
    time.sleep(3)
    
    # Check if server is running
    try:
        os.chdir("backend")
        result = subprocess.run([sys.executable, "check_server.py"], 
                              capture_output=True, text=True)
        os.chdir("..")
        
        if result.returncode == 0:
            print("✅ Backend server is running")
            return True
        else:
            print("❌ Backend server failed to start")
            print(result.stdout)
            return False
    except Exception as e:
        print(f"❌ Could not check server status: {e}")
        return False

def print_next_steps():
    """Print instructions for starting the frontend"""
    print("\n🎉 Backend is ready!")
    print("=" * 50)
    print("📱 To start the frontend:")
    print("   1. Open a new terminal")
    print("   2. Run: npm start")
    print("   3. Open: http://localhost:3000")
    print()
    print("🔗 Backend URLs:")
    print("   • API: http://localhost:8000")
    print("   • Health: http://localhost:8000/health")
    print("   • Docs: http://localhost:8000/docs")
    print()
    print("🛑 To stop the backend:")
    print("   Press Ctrl+C in this terminal")
    print("=" * 50)

def main():
    print_banner()
    
    # Check system requirements
    if not check_python_version():
        return False
    
    if not check_backend_setup():
        return False
    
    check_frontend_setup()  # Non-blocking check
    
    # Install backend dependencies if needed
    try:
        os.chdir("backend")
        # Quick check if dependencies are installed
        import fastapi
        print("✅ Backend dependencies already installed")
        os.chdir("..")
    except ImportError:
        os.chdir("..")
        if not install_backend_dependencies():
            return False
    
    # Start backend server
    if not start_backend_server():
        return False
    
    # Print next steps
    print_next_steps()
    
    # Keep the script running to maintain the server
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down CuraCore...")
        return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Startup failed: {e}")
        sys.exit(1)