from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from datetime import timedelta
import logging
from database import Database
from auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
from models import UserRegister, UserLogin, UserResponse, Token, ChatMessage, ChatResponse, MoodEntry, MoodResponse, QuizAnswer
from quiz_service import QuizService
# Try to import full AI service, fallback to lite version
try:
    from ai_service import AIService
    print("✓ Using full AI services & Agentic AI is Monitoring")
except ImportError as e:
    print(f"⚠️  Full AI dependencies not available: {e}")
    print("📦 Using lightweight AI service (keyword-based)")
    from ai_service_lite import AIService
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MentalEase Auth API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative React port
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Handle preflight requests
@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Initialize database, AI service, and quiz service
db = Database()
ai_service = AIService()
quiz_service = QuizService()

# Security
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    user_id = verify_token(token)
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

@app.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register a new user"""
    user = db.create_user(user_data.name, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user"""
    user = db.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.post("/chat/send")
async def send_chat_message(
    chat_data: ChatMessage, 
    current_user: dict = Depends(get_current_user)
):
    """Send a chat message and get AI response with emotion analysis"""
    user_id = current_user["id"]
    user_name = current_user["name"]
    
    # PRIORITY: Check for crisis situations first
    crisis_info = ai_service.detect_crisis(chat_data.message)
    
    # Log crisis situations for monitoring and follow-up
    if crisis_info['crisis_detected']:
        print(f"🚨 CRISIS ALERT - User {user_id} ({user_name}): {crisis_info}")
        # In production, this should trigger alerts to mental health professionals
        # For now, we log it for monitoring
        
    # Detect emotions using pretrained model
    emotion_scores = ai_service.detect_emotion(chat_data.message)
    detected_emotion = ai_service.get_dominant_emotion(chat_data.message)
    
    # Use provided mood or detected emotion
    final_mood = chat_data.mood or detected_emotion
    
    # === GEMINI INTEGRATION: Fetch latest mood for context ===
    try:
        mood_history = db.get_mood_history(user_id, limit=1)
        current_mood = mood_history[0] if mood_history else None
        
        # Build mood context for Gemini
        mood_context = {
            'mood_label': current_mood['mood'] if current_mood else 'neutral',
            'mood_score': emotion_scores.get(detected_emotion, 0.5),
            'mood_timestamp': current_mood['timestamp'] if current_mood else 'N/A'
        }
        
        # Import and initialize Gemini client
        from gemini_client import GeminiClient
        gemini_client = GeminiClient()
        
        # Generate response using Gemini API with mood context
        bot_response, mood_update = gemini_client.generate_chat_response(
            chat_data.message,
            mood_context
        )
        
        # Update mood if Gemini detected a mood change
        if mood_update:
            # Map Gemini mood categories to our mood labels
            # Support both granular moods and legacy positive/neutral/negative
            mood_mapping = {
                # Granular moods (direct mapping)
                'happy': 'happy',
                'sad': 'sad',
                'anxious': 'anxious',
                'stressed': 'stressed',
                'calm': 'calm',
                'excited': 'excited',
                'angry': 'angry',
                'tired': 'tired',
                'neutral': 'neutral',
                # Legacy mappings (backward compatibility)
                'positive': 'happy',
                'negative': 'sad'
            }
            new_mood = mood_mapping.get(mood_update, 'neutral')
            
            # Save mood update to database
            db.save_mood_entry(
                user_id, 
                new_mood, 
                f"Updated from chat: {chat_data.message[:50]}..."
            )
            logger.info(f"Mood updated to '{new_mood}' based on Gemini analysis")
            
            # Update final_mood to reflect the change
            final_mood = new_mood
            
    except Exception as e:
        logger.error(f"Error in Gemini integration: {e}")
        # Fallback to simple response if Gemini fails
        bot_response = "I'm here to listen. Could you tell me more about how you're feeling?"
    
    # Save conversation to database with emotion data
    chat_id = db.save_chat_message(
        user_id, 
        chat_data.message, 
        bot_response, 
        final_mood,
        detected_emotion,
        emotion_scores
    )
    
    # Save mood entry if emotion detected with high confidence
    # (Only if mood wasn't already updated by Gemini)
    if detected_emotion != "neutral" and emotion_scores.get(detected_emotion, 0) > 0.4:
        # Check if we didn't already update mood via Gemini
        if not (mood_update):
            db.save_mood_entry(user_id, detected_emotion, f"Detected from chat: {chat_data.message[:100]}...")
    
    return {
        "id": chat_id,
        "user_message": chat_data.message,
        "bot_response": bot_response,
        "mood": final_mood,
        "detected_emotion": detected_emotion,
        "emotion_scores": emotion_scores,
        "crisis_detected": crisis_info['crisis_detected'],
        "crisis_severity": crisis_info['severity'] if crisis_info['crisis_detected'] else None,
        "timestamp": "now"
    }

@app.get("/chat/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    """Get chat history for current user"""
    user_id = current_user["id"]
    history = db.get_chat_history(user_id)
    return {"history": history}

@app.post("/mood/track")
async def track_mood(
    mood_data: MoodEntry, 
    current_user: dict = Depends(get_current_user)
):
    """Track user mood"""
    user_id = current_user["id"]
    mood_id = db.save_mood_entry(user_id, mood_data.mood, mood_data.notes)
    
    return {
        "id": mood_id,
        "mood": mood_data.mood,
        "notes": mood_data.notes,
        "timestamp": "now"
    }

@app.get("/mood/history")
async def get_mood_history(current_user: dict = Depends(get_current_user)):
    """Get mood history for current user"""
    user_id = current_user["id"]
    history = db.get_mood_history(user_id)
    return {"history": history}

@app.get("/mood/insights")
async def get_mood_insights(current_user: dict = Depends(get_current_user)):
    """Get mood insights and analytics"""
    user_id = current_user["id"]
    mood_history = db.get_mood_history(user_id)
    insights = ai_service.get_mood_insights(mood_history)
    return insights

@app.get("/chat/analysis")
async def analyze_conversation(current_user: dict = Depends(get_current_user)):
    """Analyze conversation sentiment and emotions"""
    user_id = current_user["id"]
    chat_history = db.get_chat_history(user_id, limit=20)
    
    # Extract user messages for analysis
    user_messages = [chat["user_message"] for chat in chat_history]
    
    # Analyze conversation sentiment
    analysis = ai_service.analyze_conversation_sentiment(user_messages)
    
    return {
        "conversation_analysis": analysis,
        "total_messages": len(user_messages),
        "recent_messages_analyzed": min(20, len(user_messages))
    }

@app.get("/")
async def root():
    return {"message": "CuraCore Auth API is running", "status": "healthy"}



@app.get("/dashboard/insights")
async def get_dashboard_insights(current_user: dict = Depends(get_current_user)):
    """Get comprehensive dashboard insights including quiz data"""
    user_id = current_user["id"]
    
    # Get recent quiz results
    recent_quiz = db.get_latest_quiz_results(user_id)
    
    # Get mood history
    mood_history = db.get_mood_history(user_id, limit=30)
    
    # Get chat analysis
    chat_history = db.get_chat_history(user_id, limit=20)
    user_messages = [chat["user_message"] for chat in chat_history]
    conversation_analysis = ai_service.analyze_conversation_sentiment(user_messages)
    
    # Generate comprehensive insights
    insights = {
        "recent_quiz": recent_quiz,
        "mood_trends": ai_service.get_mood_insights(mood_history),
        "conversation_analysis": conversation_analysis,
        "recommendations": [],
        "alerts": []
    }
    
    # Add quiz-based recommendations
    if recent_quiz and recent_quiz.get('primary_recommendations'):
        insights["recommendations"].extend(recent_quiz['primary_recommendations'])
    
    # Add alerts for critical situations
    if recent_quiz and recent_quiz.get('critical_flag'):
        insights["alerts"].append({
            "type": "critical",
            "message": "Recent quiz responses indicate you may need professional support. Please consider reaching out to a mental health professional.",
            "resources": [
                "National Suicide Prevention Lifeline: 988",
                "Crisis Text Line: Text HOME to 741741",
                "Campus Counseling Services"
            ]
        })
    
    # Add mood-based insights
    if mood_history:
        recent_moods = [entry['mood'] for entry in mood_history[-7:]]  # Last 7 entries
        if recent_moods.count('sad') >= 4 or recent_moods.count('anxious') >= 4:
            insights["alerts"].append({
                "type": "mood_pattern",
                "message": f"You've been feeling {max(set(recent_moods), key=recent_moods.count)} frequently. Consider additional support.",
                "suggestions": [
                    "Try mood tracking exercises",
                    "Practice mindfulness techniques",
                    "Consider speaking with a counselor"
                ]
            })
    
    return insights

@app.post("/quiz/start")
async def start_quiz_endpoint(current_user: dict = Depends(get_current_user)):
    """Start a new quiz session"""
    user_id = current_user["id"]
    
    # Start new quiz
    quiz_state = quiz_service.start_quiz(user_id)
    
    # Get first question
    question = quiz_service.get_next_question(quiz_state)
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate quiz questions"
        )
    
    # Store quiz state in memory (same approach as answer endpoint)
    if not hasattr(submit_quiz_answer, 'quiz_states'):
        submit_quiz_answer.quiz_states = {}
    
    state_key = f"{user_id}_{quiz_state['quiz_id']}"
    submit_quiz_answer.quiz_states[state_key] = quiz_state
    
    return {
        "quiz_state": {"quiz_id": quiz_state['quiz_id']},  # Only return quiz_id to client
        "question": question
    }

@app.post("/quiz/answer")
async def submit_quiz_answer(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Submit an answer to a quiz question"""
    try:
        # Get the request body
        answer_data = await request.json()
        
        quiz_id = answer_data.get("quiz_id")
        question_id = answer_data.get("question_id")
        answer = answer_data.get("answer")
        
        # For now, we'll use a simple in-memory storage approach
        # In production, store quiz_state in Redis or database
        if not hasattr(submit_quiz_answer, 'quiz_states'):
            submit_quiz_answer.quiz_states = {}
        
        # Get or create quiz state
        user_id = current_user["id"]
        state_key = f"{user_id}_{quiz_id}"
        
        if state_key not in submit_quiz_answer.quiz_states:
            # If no state found, start a new quiz
            quiz_state = quiz_service.start_quiz(user_id)
            submit_quiz_answer.quiz_states[state_key] = quiz_state
        else:
            quiz_state = submit_quiz_answer.quiz_states[state_key]
        
        if not all([quiz_id, question_id is not None, answer is not None]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields"
            )
        
        # Debug: Log current state before submitting answer
        logger.info(f"Before submit_answer - Current section: {quiz_state.get('current_section')}, Responses: {len(quiz_state.get('responses', {}))}")
        
        # Submit answer and update quiz state
        updated_quiz_state = quiz_service.submit_answer(quiz_state, question_id, answer)
        submit_quiz_answer.quiz_states[state_key] = updated_quiz_state
        
        # Debug: Log state after submitting answer
        logger.info(f"After submit_answer - Current section: {updated_quiz_state.get('current_section')}, Responses: {len(updated_quiz_state.get('responses', {}))}")
        
        # Check if quiz is complete
        next_question = quiz_service.get_next_question(updated_quiz_state)
        
        # Debug: Log next question info
        if next_question:
            logger.info(f"Next question: {next_question.get('question_id')} in section {next_question.get('section')}")
        else:
            logger.info("Quiz complete - no next question")
        
        if next_question is None:
            # Quiz complete - calculate final scores
            final_scores = quiz_service.calculate_final_scores(updated_quiz_state)
            summary = quiz_service.generate_quiz_summary(updated_quiz_state, final_scores)
            
            # Save quiz results to database
            try:
                db.save_quiz_results_new(current_user["id"], quiz_id, summary)
                logger.info(f"Quiz results saved for user {current_user['id']}")
            except Exception as e:
                logger.error(f"Failed to save quiz results: {e}")
            
            # Clean up quiz state
            if state_key in submit_quiz_answer.quiz_states:
                del submit_quiz_answer.quiz_states[state_key]
            
            return {
                "quiz_complete": True,
                "summary": summary,
                "critical_flag": updated_quiz_state.get("critical_flag", False)
            }
        else:
            return {
                "quiz_complete": False,
                "question": next_question,
                "critical_flag": updated_quiz_state.get("critical_flag", False)
            }
            
    except Exception as e:
        logger.error(f"Error in quiz answer submission: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process quiz answer"
        )

@app.get("/quiz/history")
async def get_quiz_history(current_user: dict = Depends(get_current_user)):
    """Get quiz history for current user"""
    user_id = current_user["id"]
    try:
        history = db.get_quiz_history_new(user_id)
        return {"history": history}
    except Exception as e:
        logger.error(f"Failed to get quiz history: {e}")
        return {"history": [], "message": "Unable to load quiz history"}

@app.get("/dashboard/quiz-insights")
async def get_quiz_insights(current_user: dict = Depends(get_current_user)):
    """Get comprehensive quiz insights for dashboard"""
    user_id = current_user["id"]
    try:
        latest_quiz = db.get_latest_quiz_results(user_id)
        if not latest_quiz:
            return {"has_quiz": False, "message": "No quiz taken yet"}
        
        # Generate comprehensive suggestions based on quiz results
        suggestions = generate_quiz_suggestions(latest_quiz)
        
        # Parse scores if available
        scores_data = {}
        if 'scores' in latest_quiz and latest_quiz['scores']:
            import json
            if isinstance(latest_quiz['scores'], str):
                scores_data = json.loads(latest_quiz['scores'])
            else:
                scores_data = latest_quiz['scores']
        
        # Calculate days since quiz
        from datetime import datetime
        quiz_date = datetime.fromisoformat(latest_quiz['timestamp'].replace('Z', '+00:00'))
        days_since = (datetime.now() - quiz_date).days
        
        return {
            "has_quiz": True,
            "quiz_summary": {
                "quiz_id": latest_quiz.get('quiz_id', ''),
                "overall_severity": latest_quiz['overall_severity'],
                "main_concerns": latest_quiz['main_concerns'][:3],  # Top 3 concerns
                "critical_flag": latest_quiz['critical_flag'],
                "timestamp": latest_quiz['timestamp'],
                "days_since": days_since,
                "scores": scores_data,
                "total_concerns": len(latest_quiz['main_concerns']) if latest_quiz['main_concerns'] else 0
            },
            "suggestions": suggestions,
            "next_steps": get_next_steps(latest_quiz),
            "wellness_tip": get_personalized_wellness_tip(latest_quiz)
        }
    except Exception as e:
        logger.error(f"Failed to get quiz insights: {e}")
        return {"has_quiz": False, "message": "Unable to load quiz insights"}

@app.get("/quiz/summary")
async def get_quiz_summary(current_user: dict = Depends(get_current_user)):
    """Get simplified quiz summary for display in other parts of the website"""
    user_id = current_user["id"]
    try:
        latest_quiz = db.get_latest_quiz_results(user_id)
        if not latest_quiz:
            return {"has_quiz": False}
        
        # Calculate days since quiz
        from datetime import datetime
        quiz_date = datetime.fromisoformat(latest_quiz['timestamp'].replace('Z', '+00:00'))
        days_since = (datetime.now() - quiz_date).days
        
        # Get simple suggestion based on severity
        simple_suggestion = get_simple_suggestion(latest_quiz['overall_severity'], latest_quiz.get('critical_flag', False))
        
        return {
            "has_quiz": True,
            "overall_severity": latest_quiz['overall_severity'],
            "primary_concern": latest_quiz['main_concerns'][0] if latest_quiz['main_concerns'] else None,
            "critical_flag": latest_quiz['critical_flag'],
            "days_since": days_since,
            "simple_suggestion": simple_suggestion,
            "severity_emoji": get_severity_emoji(latest_quiz['overall_severity']),
            "last_taken": latest_quiz['timestamp']
        }
    except Exception as e:
        logger.error(f"Failed to get quiz summary: {e}")
        return {"has_quiz": False}

def get_simple_suggestion(severity, critical_flag):
    """Get a simple suggestion for quick display"""
    if critical_flag:
        return "Please consider reaching out for professional support"
    
    suggestions = {
        'severe': "Consider speaking with a counselor about your wellbeing",
        'moderate': "Try incorporating stress management techniques into your routine",
        'mild': "Keep up your positive mental health habits"
    }
    
    return suggestions.get(severity, "Continue monitoring your wellbeing")

def get_severity_emoji(severity):
    """Get emoji representation of severity"""
    emojis = {
        'severe': '😟',
        'moderate': '😐', 
        'mild': '😊'
    }
    return emojis.get(severity, '🤔')

def get_next_steps(quiz_results):
    """Get recommended next steps based on quiz results"""
    severity = quiz_results['overall_severity']
    critical_flag = quiz_results.get('critical_flag', False)
    
    if critical_flag:
        return [
            {"action": "Seek immediate help", "priority": "urgent", "description": "Contact a mental health professional or crisis line"},
            {"action": "Talk to someone", "priority": "high", "description": "Reach out to a trusted friend, family member, or counselor"},
            {"action": "Use campus resources", "priority": "high", "description": "Visit your campus counseling center"}
        ]
    
    if severity == 'severe':
        return [
            {"action": "Schedule counseling", "priority": "high", "description": "Book an appointment with a mental health professional"},
            {"action": "Create support network", "priority": "medium", "description": "Connect with friends, family, or support groups"},
            {"action": "Daily self-care", "priority": "medium", "description": "Establish a routine with activities that bring you joy"}
        ]
    elif severity == 'moderate':
        return [
            {"action": "Try coping strategies", "priority": "medium", "description": "Implement stress management and relaxation techniques"},
            {"action": "Monitor progress", "priority": "medium", "description": "Track your mood and wellbeing regularly"},
            {"action": "Consider counseling", "priority": "low", "description": "Think about talking to a counselor if symptoms persist"}
        ]
    else:
        return [
            {"action": "Maintain habits", "priority": "low", "description": "Continue your positive mental health practices"},
            {"action": "Regular check-ins", "priority": "low", "description": "Keep monitoring your wellbeing"},
            {"action": "Help others", "priority": "low", "description": "Share your healthy coping strategies with peers"}
        ]

def get_personalized_wellness_tip(quiz_results):
    """Get a personalized wellness tip based on quiz results"""
    concerns = quiz_results.get('main_concerns', [])
    severity = quiz_results['overall_severity']
    
    tips = {
        'Stress & Academic Pressure': "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8. Perfect for reducing academic stress!",
        'Anxiety / Worry': "Practice the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
        'Low Mood / Sadness': "Take a 10-minute walk outside today. Natural light and movement can significantly boost your mood.",
        'Sleep Problems': "Create a 'digital sunset' - turn off screens 1 hour before bed and try reading or gentle stretching instead."
    }
    
    # Return tip for primary concern, or general tip
    if concerns:
        return tips.get(concerns[0], "Remember: Small daily actions compound into significant positive changes over time.")
    
    return "Take 3 deep breaths right now. You're doing better than you think, and every step forward counts."

def generate_quiz_suggestions(quiz_results):
    """Generate comprehensive suggestions based on quiz results"""
    severity = quiz_results['overall_severity']
    concerns = quiz_results['main_concerns']
    critical_flag = quiz_results.get('critical_flag', False)
    
    suggestions = []
    
    # Critical situation suggestions
    if critical_flag:
        suggestions.extend([
            "🚨 Please consider reaching out to a mental health professional immediately",
            "Contact crisis helpline: 988 (National Suicide Prevention Lifeline)",
            "Reach out to trusted friends, family, or counselors for support",
            "Consider visiting your campus counseling center"
        ])
        return suggestions
    
    # Concern-specific suggestions
    concern_suggestions = {
        'Stress & Academic Pressure': [
            "Try the Pomodoro Technique for better time management",
            "Practice deep breathing exercises during stressful moments",
            "Create a realistic study schedule with regular breaks",
            "Consider joining study groups for peer support"
        ],
        'Anxiety / Worry': [
            "Practice grounding techniques (5-4-3-2-1 method)",
            "Try progressive muscle relaxation before bed",
            "Limit caffeine intake, especially in the afternoon",
            "Consider mindfulness meditation apps like Headspace or Calm"
        ],
        'Low Mood / Sadness': [
            "Engage in regular physical activity, even light walking",
            "Maintain social connections with friends and family",
            "Practice gratitude journaling for 5 minutes daily",
            "Ensure you're getting adequate sunlight exposure"
        ],
        'Sleep Problems': [
            "Establish a consistent sleep schedule",
            "Create a relaxing bedtime routine",
            "Limit screen time 1 hour before bed",
            "Keep your bedroom cool, dark, and quiet"
        ]
    }
    
    # Add concern-specific suggestions
    for concern in concerns[:2]:  # Top 2 concerns
        if concern in concern_suggestions:
            suggestions.extend(concern_suggestions[concern][:2])
    
    # Severity-based general suggestions
    if severity == 'severe':
        suggestions.extend([
            "Consider scheduling an appointment with a counselor",
            "Practice daily self-care activities that bring you joy",
            "Don't hesitate to ask for help from trusted people"
        ])
    elif severity == 'moderate':
        suggestions.extend([
            "Try incorporating stress management techniques into your routine",
            "Maintain regular sleep and exercise schedules",
            "Consider talking to someone you trust about how you're feeling"
        ])
    else:
        suggestions.extend([
            "Keep up your positive mental health habits",
            "Continue monitoring your wellbeing regularly",
            "Share your healthy coping strategies with others"
        ])
    
    return suggestions[:6]  # Limit to 6 suggestions

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CuraCore Backend",
        "ai_service": "full" if "ai_service" in str(type(ai_service)) else "lite"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)