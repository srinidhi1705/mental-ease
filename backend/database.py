import sqlite3
import bcrypt
from datetime import datetime
import os

class Database:
    def __init__(self, db_path="users.db"):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """Initialize the database with users, chats, and moods tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                streak INTEGER DEFAULT 0,
                badges TEXT DEFAULT '[]',
                join_date TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                user_message TEXT NOT NULL,
                bot_response TEXT NOT NULL,
                mood TEXT,
                detected_emotion TEXT,
                emotion_scores TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mood_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                mood TEXT NOT NULL,
                notes TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        

        
        # Create quiz sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                quiz_state TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create quiz results table with new schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_results_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                quiz_id TEXT,
                overall_severity TEXT,
                main_concerns TEXT,
                scores TEXT,
                recommendations TEXT,
                critical_flag BOOLEAN DEFAULT FALSE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Check if we need to migrate from old table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='quiz_results'")
        old_table_exists = cursor.fetchone()
        
        if old_table_exists:
            # Migrate data from old table to new table if needed
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO quiz_results_new (user_id, overall_severity, critical_flag, timestamp)
                    SELECT user_id, overall_severity, critical_flag, 
                           COALESCE(completed_at, timestamp, CURRENT_TIMESTAMP) as timestamp
                    FROM quiz_results 
                    WHERE id NOT IN (SELECT COALESCE(quiz_id, '') FROM quiz_results_new)
                ''')
            except sqlite3.OperationalError:
                # If migration fails, just continue - the new table structure will be used
                pass
            
        # Drop old table and rename new one
        cursor.execute('DROP TABLE IF EXISTS quiz_results')
        cursor.execute('ALTER TABLE quiz_results_new RENAME TO quiz_results')
        
        conn.commit()
        conn.close()
    
    def hash_password(self, password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password, hashed):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_user(self, name, email, password):
        """Create a new user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            password_hash = self.hash_password(password)
            join_date = datetime.now().isoformat()
            
            cursor.execute('''
                INSERT INTO users (name, email, password_hash, join_date)
                VALUES (?, ?, ?, ?)
            ''', (name, email, password_hash, join_date))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            # Return user data without password
            return {
                "id": user_id,
                "name": name,
                "email": email,
                "streak": 0,
                "badges": [],
                "joinDate": join_date
            }
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def authenticate_user(self, email, password):
        """Authenticate user login"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, password_hash, streak, badges, join_date
            FROM users WHERE email = ?
        ''', (email,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user and self.verify_password(password, user[3]):
            return {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "streak": user[4],
                "badges": eval(user[5]) if user[5] else [],
                "joinDate": user[6]
            }
        return None
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, streak, badges, join_date
            FROM users WHERE id = ?
        ''', (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "streak": user[3],
                "badges": eval(user[4]) if user[4] else [],
                "joinDate": user[5]
            }
        return None
    
    def save_chat_message(self, user_id, user_message, bot_response, mood=None, detected_emotion=None, emotion_scores=None):
        """Save chat conversation with emotion data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if new columns exist
        cursor.execute("PRAGMA table_info(chat_conversations)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'detected_emotion' in columns and 'emotion_scores' in columns:
            # New schema with emotion data
            emotion_scores_json = str(emotion_scores) if emotion_scores else None
            
            cursor.execute('''
                INSERT INTO chat_conversations (user_id, user_message, bot_response, mood, detected_emotion, emotion_scores)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, user_message, bot_response, mood, detected_emotion, emotion_scores_json))
        else:
            # Old schema without emotion data
            cursor.execute('''
                INSERT INTO chat_conversations (user_id, user_message, bot_response, mood)
                VALUES (?, ?, ?, ?)
            ''', (user_id, user_message, bot_response, mood))
        
        chat_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return chat_id
    
    def get_chat_history(self, user_id, limit=50):
        """Get chat history for user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if new columns exist
        cursor.execute("PRAGMA table_info(chat_conversations)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'detected_emotion' in columns and 'emotion_scores' in columns:
            # New schema with emotion data
            cursor.execute('''
                SELECT id, user_message, bot_response, mood, detected_emotion, emotion_scores, timestamp
                FROM chat_conversations 
                WHERE user_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            ''', (user_id, limit))
            
            chats = cursor.fetchall()
            conn.close()
            
            return [{
                "id": chat[0],
                "user_message": chat[1],
                "bot_response": chat[2],
                "mood": chat[3],
                "detected_emotion": chat[4],
                "emotion_scores": chat[5],
                "timestamp": chat[6]
            } for chat in chats]
        else:
            # Old schema without emotion data
            cursor.execute('''
                SELECT id, user_message, bot_response, mood, timestamp
                FROM chat_conversations 
                WHERE user_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            ''', (user_id, limit))
            
            chats = cursor.fetchall()
            conn.close()
            
            return [{
                "id": chat[0],
                "user_message": chat[1],
                "bot_response": chat[2],
                "mood": chat[3],
                "detected_emotion": None,
                "emotion_scores": None,
                "timestamp": chat[4]
            } for chat in chats]
    
    def save_mood_entry(self, user_id, mood, notes=None):
        """Save mood entry"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO mood_entries (user_id, mood, notes)
            VALUES (?, ?, ?)
        ''', (user_id, mood, notes))
        
        mood_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return mood_id
    
    def get_mood_history(self, user_id, limit=30):
        """Get mood history for user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, mood, notes, timestamp
            FROM mood_entries 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (user_id, limit))
        
        moods = cursor.fetchall()
        conn.close()
        
        return [{
            "id": mood[0],
            "mood": mood[1],
            "notes": mood[2],
            "timestamp": mood[3]
        } for mood in moods]
    
    def save_quiz_session(self, user_id, quiz_state):
        """Save quiz session state"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        quiz_id = quiz_state['quiz_id']
        quiz_state_json = json.dumps(quiz_state)
        
        cursor.execute('''
            INSERT INTO quiz_sessions (id, user_id, quiz_state)
            VALUES (?, ?, ?)
        ''', (quiz_id, user_id, quiz_state_json))
        
        conn.commit()
        conn.close()
        return quiz_id
    
    def get_quiz_session(self, quiz_id, user_id):
        """Get quiz session state"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT quiz_state FROM quiz_sessions 
            WHERE id = ? AND user_id = ?
        ''', (quiz_id, user_id))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return json.loads(result[0])
        return None
    
    def update_quiz_session(self, quiz_id, quiz_state):
        """Update quiz session state"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        quiz_state_json = json.dumps(quiz_state)
        
        cursor.execute('''
            UPDATE quiz_sessions 
            SET quiz_state = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (quiz_state_json, quiz_id))
        
        conn.commit()
        conn.close()
    
    def save_quiz_results(self, quiz_id, user_id, summary):
        """Save completed quiz results"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        quiz_data_json = json.dumps(summary)
        
        cursor.execute('''
            INSERT INTO quiz_results (id, user_id, quiz_data, overall_severity, primary_mood, critical_flag)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            quiz_id, 
            user_id, 
            quiz_data_json, 
            summary.get('overall_severity'),
            summary.get('suggested_mood'),
            summary.get('critical_flag', False)
        ))
        
        conn.commit()
        conn.close()
    
    def get_quiz_results(self, quiz_id, user_id):
        """Get quiz results"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT quiz_data FROM quiz_results 
            WHERE id = ? AND user_id = ?
        ''', (quiz_id, user_id))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return json.loads(result[0])
        return None
    
    def get_quiz_history(self, user_id, limit=10):
        """Get user's quiz history"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, overall_severity, primary_mood, critical_flag, timestamp
            FROM quiz_results 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (user_id, limit))
        
        results = cursor.fetchall()
        conn.close()
        
        return [{
            "quiz_id": result[0],
            "overall_severity": result[1],
            "primary_mood": result[2],
            "critical_flag": bool(result[3]),
            "timestamp": result[4]
        } for result in results]
    
    def get_latest_quiz_results(self, user_id):
        """Get user's most recent quiz results"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT quiz_data FROM quiz_results 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 1
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return json.loads(result[0])
        return None
    
    def save_quiz_results_new(self, user_id, quiz_id, summary):
        """Save completed quiz results to the new quiz_results table"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO quiz_results (
                user_id, quiz_id, overall_severity, main_concerns, 
                scores, recommendations, critical_flag
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            quiz_id,
            summary.get('overall_severity', 'mild'),
            json.dumps(summary.get('main_concerns', [])),
            json.dumps(summary.get('scores', {})),
            json.dumps(summary.get('primary_recommendations', [])),
            summary.get('critical_flag', False)
        ))
        
        conn.commit()
        conn.close()
    
    def get_latest_quiz_results(self, user_id):
        """Get the most recent quiz results for a user"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT quiz_id, overall_severity, main_concerns, scores, 
                   recommendations, critical_flag, timestamp
            FROM quiz_results 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 1
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'quiz_id': result[0],
                'overall_severity': result[1],
                'main_concerns': json.loads(result[2]),
                'scores': json.loads(result[3]),
                'recommendations': json.loads(result[4]),
                'critical_flag': result[5],
                'timestamp': result[6]
            }
        return None
    
    def get_quiz_history_new(self, user_id, limit=10):
        """Get quiz history for user"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT quiz_id, overall_severity, main_concerns, critical_flag, timestamp
            FROM quiz_results 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (user_id, limit))
        
        results = cursor.fetchall()
        conn.close()
        
        return [{
            'quiz_id': result[0],
            'overall_severity': result[1],
            'main_concerns': json.loads(result[2]),
            'critical_flag': result[3],
            'timestamp': result[4]
        } for result in results]