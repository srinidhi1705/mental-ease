#!/usr/bin/env python3
"""
Simple script to check if the backend server is running
"""

import sys
try:
    import requests
except ImportError:
    print("❌ 'requests' library not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

def check_server():
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend server is running!")
            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   Service: {data.get('service', 'unknown')}")
            print(f"   AI Service: {data.get('ai_service', 'unknown')}")
            return True
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server at http://localhost:8000")
        print("   Make sure to start the server with: python start.py")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server request timed out")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Checking backend server status...")
    success = check_server()
    sys.exit(0 if success else 1)