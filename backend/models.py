from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    streak: int
    badges: List[str]
    joinDate: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ChatMessage(BaseModel):
    message: str
    mood: Optional[str] = None

class ChatResponse(BaseModel):
    id: int
    user_message: str
    bot_response: str
    mood: Optional[str]
    timestamp: datetime

class MoodEntry(BaseModel):
    mood: str
    notes: Optional[str] = None

class MoodResponse(BaseModel):
    id: int
    mood: str
    notes: Optional[str]
    timestamp: datetime

class QuizAnswer(BaseModel):
    quiz_id: str
    question_id: str
    answer: str

class QuizQuestion(BaseModel):
    question_id: str
    question: str
    type: str
    options: Optional[List[str]] = None
    scale: Optional[List[int]] = None
    required: bool = False
    section: str
    level: Optional[int] = None

class QuizProgress(BaseModel):
    current_section: str
    completed_sections: List[str]
    total_sections: int

class QuizSummary(BaseModel):
    quiz_id: str
    user_id: int
    completion_date: str
    main_concerns: List[str]
    overall_severity: str
    critical_flag: bool
    primary_recommendations: List[str]
    suggested_mood: str