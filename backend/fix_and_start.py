#!/usr/bin/env python3
"""
Quick fix script to resolve database issues and start the server
"""

import os
import sys
import subprocess

def main():
    print("🔧 CuraCore Quick Fix")
    print("=" * 30)
    
    # Check if database exists and has issues
    if os.path.exists("users.db"):
        print("📊 Found existing database")
        print("🔄 Migrating database schema...")
        
        try:
            subprocess.run([sys.executable, "migrate_database.py"], 
                         input="1\n", text=True, check=True)
            print("✅ Database migration completed")
        except subprocess.CalledProcessError:
            print("⚠️  Migration failed, resetting database...")
            try:
                os.remove("users.db")
                print("✅ Database reset")
            except Exception as e:
                print(f"❌ Could not reset database: {e}")
                return False
    else:
        print("📊 No existing database found")
    
    print("🚀 Starting server...")
    
    try:
        # Start the server
        subprocess.run([sys.executable, "start.py"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)