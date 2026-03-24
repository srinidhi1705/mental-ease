"""
Gemini API Client for CuraCore Chatbot

This module provides a clean interface to the Google Gemini API for generating
chatbot responses with mood context integration.
"""

import os
import logging
import re
from typing import Dict, Tuple, Optional

logger = logging.getLogger(__name__)

# Import Gemini SDK
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai package not installed. Gemini features will be disabled.")


class GeminiClient:
    """
    Client for interacting with Google Gemini API.
    
    Responsibilities:
    - Generate chat responses using Gemini API
    - Inject mood context into prompts
    - Parse mood updates from responses
    - Handle errors gracefully with fallback responses
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        """
        Initialize Gemini client.
        
        Args:
            api_key: Google Gemini API key (defaults to GEMINI_API_KEY env var)
            model_name: Gemini model to use (default: gemini-1.5-flash)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = model_name
        self.model = None
        
        if not GEMINI_AVAILABLE:
            logger.error("Gemini SDK not available. Install with: pip install google-generativeai")
            return
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set. Gemini features will use fallback responses.")
            return
        
        try:
            # Configure Gemini API
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info(f"✓ Gemini client initialized with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self.model = None
    
    def generate_chat_response(
        self, 
        user_message: str, 
        mood_context: Dict[str, any]
    ) -> Tuple[str, Optional[str]]:
        """
        Generate a chat response using Gemini API with mood context.
        
        Args:
            user_message: The user's message
            mood_context: Dictionary containing:
                - mood_label: Current mood (e.g., 'happy', 'sad', 'anxious')
                - mood_score: Confidence score (0-1)
                - mood_timestamp: When mood was last updated
        
        Returns:
            Tuple of (response_text, mood_update)
            - response_text: The chatbot response
            - mood_update: Detected mood change ('happy', 'sad', 'anxious', 'stressed', 
                          'calm', 'excited', 'angry', 'tired', 'neutral', or None)
        """
        # Validate inputs
        if not user_message or not user_message.strip():
            return "I'm here to listen. What's on your mind?", None
        
        # Check if Gemini is available
        if not self.model:
            logger.warning("Gemini model not available, using fallback response")
            return self._get_fallback_response(user_message), None
        
        try:
            # Build the prompt with mood context
            prompt = self._build_prompt(user_message, mood_context)
            
            # Call Gemini API
            logger.info(f"Calling Gemini API for message: {user_message[:50]}...")
            response = self.model.generate_content(prompt)
            
            # Extract response text
            if not response or not response.text:
                logger.error("Empty response from Gemini API")
                return self._get_fallback_response(user_message), None
            
            response_text = response.text.strip()
            
            # Parse mood update if present
            response_text, mood_update = self._parse_mood_update(response_text)
            
            logger.info(f"✓ Gemini response generated successfully (mood_update: {mood_update})")
            return response_text, mood_update
            
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            return self._get_fallback_response(user_message), None
    
    def _build_prompt(self, user_message: str, mood_context: Dict[str, any]) -> str:
        """
        Build the prompt for Gemini with mood context.
        
        Args:
            user_message: User's message
            mood_context: Mood context dictionary
        
        Returns:
            Formatted prompt string
        """
        mood_label = mood_context.get('mood_label', 'neutral')
        mood_score = mood_context.get('mood_score', 0.5)
        mood_timestamp = mood_context.get('mood_timestamp', 'N/A')
        
        prompt = f"""You are MentalEase, a calm and supportive mental health assistant.

Context:
- The user is interacting with a mental wellness platform.
- The platform already tracks mood, activities, and reminders.
- You are ONLY responsible for generating the chat reply.

User Mood (from database):
- Current mood label: {mood_label}
- Mood score: {mood_score}
- Last updated: {mood_timestamp}

Guidelines:
- Be empathetic, calm, and non-judgmental.
- Keep responses short and supportive.
- Do NOT give medical diagnoses.
- Do NOT mention internal systems, databases, or APIs.
- Do NOT repeat mood data unless it feels natural.
- Encourage gentle grounding or small actions if mood is negative.
- Reinforce positivity if mood is positive.
- Avoid overwhelming the user.

Response Style:
- Friendly, human, and simple.
- 3–6 sentences maximum.

User Message:
"{user_message}"

If the user's message strongly implies a mood change, append a final line:
MOOD_UPDATE: <happy | sad | anxious | stressed | calm | excited | angry | tired | neutral>

Choose the most specific mood that matches the user's emotional state:
- happy: joy, contentment, satisfaction, relief
- sad: sadness, disappointment, loneliness, grief
- anxious: worry, nervousness, fear, unease
- stressed: overwhelmed, pressure, tension, burnout
- calm: peaceful, relaxed, serene, composed
- excited: enthusiasm, anticipation, energy, eagerness
- angry: frustration, irritation, resentment, annoyance
- tired: exhausted, fatigued, drained, weary
- neutral: balanced, stable, neither positive nor negative

Generate the best possible response."""
        
        return prompt
    
    def _parse_mood_update(self, response_text: str) -> Tuple[str, Optional[str]]:
        """
        Parse and extract mood update from Gemini response.
        
        Args:
            response_text: Raw response from Gemini
        
        Returns:
            Tuple of (cleaned_response, mood_update)
            - cleaned_response: Response without MOOD_UPDATE tag
            - mood_update: One of 'happy', 'sad', 'anxious', 'stressed', 'calm', 
                          'excited', 'angry', 'tired', 'neutral', or None
        """
        # Look for MOOD_UPDATE tag (case-insensitive)
        # Support both granular moods and legacy positive/neutral/negative
        mood_pattern = r'MOOD_UPDATE:\s*(happy|sad|anxious|stressed|calm|excited|angry|tired|neutral|positive|negative)'
        match = re.search(mood_pattern, response_text, re.IGNORECASE)
        
        if match:
            mood_update = match.group(1).lower()
            # Remove the MOOD_UPDATE line from response
            cleaned_response = re.sub(mood_pattern, '', response_text, flags=re.IGNORECASE).strip()
            logger.info(f"Detected mood update: {mood_update}")
            return cleaned_response, mood_update
        
        return response_text, None
    
    def _get_fallback_response(self, user_message: str) -> str:
        """
        Get a fallback response when Gemini API is unavailable.
        
        Args:
            user_message: User's message
        
        Returns:
            Fallback response string
        """
        fallback_responses = [
            "I'm here to listen. Could you tell me more about how you're feeling?",
            "Thank you for sharing. I'm here to support you. What's been on your mind?",
            "I appreciate you opening up. How can I help you today?",
            "I'm listening. Would you like to talk more about what's going on?",
        ]
        
        # Simple hash to get consistent but varied fallback
        index = len(user_message) % len(fallback_responses)
        return fallback_responses[index]


# Convenience function for easy import
def create_gemini_client(api_key: Optional[str] = None) -> GeminiClient:
    """
    Factory function to create a GeminiClient instance.
    
    Args:
        api_key: Optional API key (defaults to env var)
    
    Returns:
        GeminiClient instance
    """
    return GeminiClient(api_key=api_key)
