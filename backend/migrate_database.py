#!/usr/bin/env python3
"""
Database migration script to update existing database with new columns
"""

import sqlite3
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database(db_path="users.db"):
    """Migrate existing database to new schema"""
    
    if not os.path.exists(db_path):
        logger.info("No existing database found, will create new one")
        return True
    
    logger.info(f"Migrating database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if new columns exist
        cursor.execute("PRAGMA table_info(chat_conversations)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add missing columns if they don't exist
        if 'detected_emotion' not in columns:
            logger.info("Adding detected_emotion column...")
            cursor.execute('''
                ALTER TABLE chat_conversations 
                ADD COLUMN detected_emotion TEXT
            ''')
        
        if 'emotion_scores' not in columns:
            logger.info("Adding emotion_scores column...")
            cursor.execute('''
                ALTER TABLE chat_conversations 
                ADD COLUMN emotion_scores TEXT
            ''')
        
        conn.commit()
        logger.info("✅ Database migration completed successfully")
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(chat_conversations)")
        new_columns = [column[1] for column in cursor.fetchall()]
        logger.info(f"Current columns: {new_columns}")
        
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        return False

def reset_database(db_path="users.db"):
    """Reset database by deleting and recreating it"""
    logger.info("Resetting database...")
    
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
            logger.info(f"Deleted existing database: {db_path}")
        
        # Import and initialize database
        from database import Database
        db = Database(db_path)
        logger.info("✅ Database reset and recreated successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database reset failed: {e}")
        return False

def main():
    print("🔧 CuraCore Database Migration")
    print("=" * 40)
    
    db_path = "users.db"
    
    if os.path.exists(db_path):
        print("📊 Existing database found")
        print("Choose an option:")
        print("1. 🔄 Migrate existing database (preserve data)")
        print("2. 🗑️  Reset database (lose all data)")
        
        while True:
            choice = input("Enter choice (1 or 2): ").strip()
            if choice == "1":
                success = migrate_database(db_path)
                break
            elif choice == "2":
                confirm = input("⚠️  This will delete all data. Continue? (y/N): ").strip().lower()
                if confirm == 'y':
                    success = reset_database(db_path)
                    break
                else:
                    print("Operation cancelled")
                    return
            else:
                print("Please enter 1 or 2")
    else:
        print("📊 No existing database found, creating new one...")
        success = reset_database(db_path)
    
    if success:
        print("\n🎉 Database is ready!")
        print("You can now start the server with: python start.py")
    else:
        print("\n❌ Database migration failed!")
        print("Try resetting the database or check the error messages above")

if __name__ == "__main__":
    main()