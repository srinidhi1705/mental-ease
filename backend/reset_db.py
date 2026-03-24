#!/usr/bin/env python3
"""
Database reset script for CuraCore
This will recreate the database with the correct schema
"""
import os
import sqlite3
from database import Database

def reset_database():
    """Reset the database with correct schema"""
    db_path = "users.db"
    
    # Backup existing database if it exists
    if os.path.exists(db_path):
        backup_path = f"{db_path}.backup"
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(db_path, backup_path)
        print(f"✓ Backed up existing database to {backup_path}")
    
    # Create new database with correct schema
    db = Database()
    print("✓ Created new database with correct schema")
    
    # Test the database
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if quiz_results table has correct columns
        cursor.execute("PRAGMA table_info(quiz_results)")
        columns = cursor.fetchall()
        
        print("✓ Quiz results table columns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
            
        conn.close()
        print("✓ Database reset completed successfully!")
        
    except Exception as e:
        print(f"✗ Error testing database: {e}")

if __name__ == "__main__":
    reset_database()