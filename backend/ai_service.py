import os
import random
import re
import torch
import numpy as np
from typing import Dict, List, Optional
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    pipeline, AutoModel
)
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # Model cache directory
        self.cache_dir = "models"
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Initialize models
        self._load_emotion_model()
        self._load_chat_model()
        
        # Predefined responses for different emotions and contexts
        self.emotion_responses = {
            'joy': [
                "That's wonderful to hear! Your happiness is contagious. What's bringing you so much joy today?",
                "I love seeing you in such a positive mood! Keep embracing those good vibes.",
                "Your joy is beautiful! What's been the highlight of your day?",
                "It's amazing to see you feeling so happy! Tell me more about what's making you feel this way."
            ],
            'sadness': [
                "I'm sorry you're feeling down. It's completely okay to feel sad sometimes. Would you like to talk about what's bothering you?",
                "I hear that you're going through a tough time. Remember, it's okay to not be okay. I'm here to listen.",
                "Sadness is a natural part of life. You're not alone in this. What would help you feel a little better right now?",
                "I can sense you're feeling low. Sometimes talking about it helps. What's weighing on your heart?"
            ],
            'anger': [
                "I can feel your frustration. It's completely valid to feel angry. What's triggering these feelings?",
                "Anger is a natural emotion. Let's work through this together. What happened that upset you?",
                "I hear your anger, and it's okay to feel this way. Sometimes we need to express these feelings. What's bothering you?",
                "Your feelings are valid. When we're angry, it often means something important to us has been affected. What's going on?"
            ],
            'fear': [
                "I understand you're feeling anxious or scared. These feelings are completely normal. What's causing you to feel this way?",
                "Fear can be overwhelming, but you're stronger than you think. What's making you feel afraid right now?",
                "It's okay to feel scared sometimes. You're brave for sharing this with me. What's on your mind?",
                "Anxiety and fear are tough emotions to deal with. Let's talk through what's worrying you."
            ],
            'surprise': [
                "That sounds unexpected! How are you processing this surprise?",
                "Life can be full of surprises! How are you feeling about this unexpected turn?",
                "Wow, that must have caught you off guard! Tell me more about what happened."
            ],
            'disgust': [
                "It sounds like something really bothered you. What's making you feel this way?",
                "That must be really unpleasant for you. Do you want to talk about what's troubling you?",
                "I can sense your discomfort. What's causing these negative feelings?"
            ],
            'neutral': [
                "I'm here to listen. What's on your mind today?",
                "How are you feeling right now? I'm here to support you.",
                "Tell me more about what you're thinking about.",
                "I'm listening. What would you like to talk about?"
            ]
        }
        
        self.supportive_responses = [
            "Remember, you're not alone in this journey. Every step forward, no matter how small, is progress.",
            "You're doing better than you think. Be kind to yourself today.",
            "It takes courage to reach out and talk about your feelings. I'm proud of you for being here.",
            "Your feelings are valid, and it's okay to take things one day at a time.",
            "You have the strength to get through this. I believe in you."
        ]
        
        self.greeting_responses = [
            "Hello! I'm here to listen and support you. How are you feeling today?",
            "Hi there! I'm glad you're here. What's on your mind?",
            "Welcome! I'm your AI companion, ready to chat and help you process your emotions. How can I support you today?"
        ]
        
        # How-to responses for common mental health and wellness questions
        self.how_to_responses = {
            'manage_stress': [
                "Here are some effective ways to manage stress:\n• Take deep breaths (4 counts in, hold 4, out 4)\n• Try progressive muscle relaxation\n• Go for a walk or do light exercise\n• Practice mindfulness or meditation\n• Talk to someone you trust\n• Break big tasks into smaller steps",
                "Stress management techniques that work:\n• Identify your stress triggers\n• Use the 5-4-3-2-1 grounding technique (5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste)\n• Practice saying 'no' to overwhelming commitments\n• Maintain a regular sleep schedule\n• Limit caffeine and alcohol"
            ],
            'improve_mood': [
                "Ways to naturally boost your mood:\n• Get sunlight exposure (even 10-15 minutes helps)\n• Listen to uplifting music\n• Do something creative or artistic\n• Connect with friends or family\n• Practice gratitude - write down 3 good things daily\n• Engage in physical activity\n• Help someone else",
                "Mood-boosting strategies:\n• Establish a morning routine\n• Spend time in nature\n• Practice self-compassion\n• Celebrate small wins\n• Try aromatherapy or pleasant scents\n• Watch something funny\n• Do activities that give you a sense of accomplishment"
            ],
            'deal_with_anxiety': [
                "Anxiety management techniques:\n• Practice the 4-7-8 breathing technique\n• Challenge anxious thoughts - ask 'Is this realistic?'\n• Use grounding exercises\n• Limit caffeine and news consumption\n• Create a worry time (15 min daily to process concerns)\n• Focus on what you can control",
                "Coping with anxiety:\n• Accept that some anxiety is normal\n• Use positive self-talk\n• Try progressive muscle relaxation\n• Maintain social connections\n• Keep a regular routine\n• Consider journaling your thoughts\n• Practice mindfulness meditation"
            ],
            'sleep_better': [
                "Better sleep habits:\n• Keep a consistent sleep schedule\n• Create a relaxing bedtime routine\n• Avoid screens 1 hour before bed\n• Keep your bedroom cool and dark\n• Try reading or gentle stretching\n• Avoid large meals and caffeine before bed",
                "Sleep improvement tips:\n• Use your bed only for sleep\n• If you can't sleep, get up after 20 minutes\n• Try meditation or calming music\n• Write down tomorrow's tasks to clear your mind\n• Consider herbal tea like chamomile\n• Get morning sunlight exposure"
            ],
            'build_confidence': [
                "Building self-confidence:\n• Set small, achievable goals\n• Practice positive self-talk\n• Focus on your strengths and past successes\n• Learn new skills or hobbies\n• Take care of your physical health\n• Surround yourself with supportive people",
                "Confidence-building strategies:\n• Challenge negative self-beliefs\n• Practice good posture and body language\n• Prepare well for challenges\n• Celebrate your achievements\n• Help others (builds sense of competence)\n• Step outside your comfort zone gradually"
            ],
            'handle_sadness': [
                "Dealing with sadness:\n• Allow yourself to feel the emotion\n• Talk to someone you trust\n• Engage in gentle physical activity\n• Do something kind for yourself\n• Listen to music that matches then lifts your mood\n• Consider what the sadness is telling you",
                "Coping with sad feelings:\n• Practice self-compassion\n• Maintain your daily routine\n• Connect with nature\n• Do activities that usually bring joy\n• Write in a journal\n• Remember that feelings are temporary\n• Seek professional help if sadness persists"
            ],
            'manage_anger': [
                "Managing anger effectively:\n• Take a timeout before reacting\n• Use 'I' statements instead of 'you' statements\n• Practice deep breathing or counting to 10\n• Exercise to release physical tension\n• Identify the underlying need or hurt\n• Problem-solve rather than just vent",
                "Anger management techniques:\n• Recognize early warning signs\n• Use relaxation techniques\n• Express anger constructively\n• Look for solutions, not blame\n• Practice forgiveness (for your own peace)\n• Consider if the situation will matter in 5 years"
            ]
        }
        
        # Crisis detection keywords and responses
        self.crisis_keywords = {
            'suicide': ['suicide', 'kill myself', 'end my life', 'want to die', 'better off dead', 'not worth living', 'end it all', 'take my own life'],
            'self_harm': ['cut myself', 'hurt myself', 'self harm', 'self-harm', 'harm myself', 'cut my', 'razor', 'blade'],
            'violence': ['kill someone', 'hurt someone', 'murder', 'violence', 'weapon', 'gun', 'knife', 'attack'],
            'severe_distress': ['can\'t take it', 'give up', 'hopeless', 'no point', 'worthless', 'hate myself', 'nobody cares']
        }
        
        self.crisis_responses = {
            'immediate_danger': [
                "🚨 I'm very concerned about what you've shared. Your life has value and you deserve support right now.",
                "🚨 What you're feeling is serious, and I want you to know that help is available immediately.",
                "🚨 I'm worried about your safety. Please know that you're not alone and there are people who want to help."
            ],
            'crisis_resources': {
                'suicide_prevention': "🆘 **IMMEDIATE HELP AVAILABLE:**\n• National Suicide Prevention Lifeline: 988 or 1-800-273-8255\n• Crisis Text Line: Text HOME to 741741\n• International: befrienders.org\n• Emergency: Call 911 or go to your nearest emergency room",
                'self_harm': "🆘 **GET SUPPORT NOW:**\n• Crisis Text Line: Text HOME to 741741\n• Self-Injury Outreach & Support: sioutreach.org\n• National Suicide Prevention Lifeline: 988\n• Emergency: Call 911 or go to your nearest emergency room",
                'violence': "🚨 **SAFETY FIRST:**\n• If you're having thoughts of harming others, please call 911 immediately\n• National Domestic Violence Hotline: 1-800-799-7233\n• Crisis Text Line: Text HOME to 741741\n• Go to your nearest emergency room for immediate help",
                'general_crisis': "🆘 **HELP IS AVAILABLE:**\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• SAMHSA National Helpline: 1-800-662-4357\n• Emergency: Call 911 or go to your nearest emergency room"
            },
            'calming_messages': [
                "Take a deep breath with me. You are safe right now in this moment.",
                "I want you to know that these intense feelings will pass. You are stronger than you realize.",
                "Right now, focus on your breathing. In for 4 counts, hold for 4, out for 4. You're going to get through this.",
                "You reached out, which shows incredible strength. That's the first step toward feeling better.",
                "Your life matters. Your feelings are valid. And most importantly, you are not alone."
            ]
        }

    def _load_emotion_model(self):
        """Load pretrained emotion classification model"""
        try:
            # Using a robust emotion classification model
            model_name = "j-hartmann/emotion-english-distilroberta-base"
            cache_path = os.path.join(self.cache_dir, "emotion")
            
            self.emotion_tokenizer = AutoTokenizer.from_pretrained(
                model_name, 
                cache_dir=cache_path
            )
            self.emotion_model = AutoModelForSequenceClassification.from_pretrained(
                model_name, 
                cache_dir=cache_path
            )
            self.emotion_model.to(self.device)
            self.emotion_model.eval()
            
            # Emotion labels for this model
            self.emotion_labels = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']
            logger.info("Emotion model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load emotion model: {e}")
            self.emotion_model = None
            self.emotion_tokenizer = None

    def _load_chat_model(self):
        """Load pretrained conversational model"""
        try:
            # Using DialoGPT for conversational responses
            cache_path = os.path.join(self.cache_dir, "chat")
            
            self.chat_pipeline = pipeline(
                "text-generation",
                model="microsoft/DialoGPT-medium",
                tokenizer="microsoft/DialoGPT-medium",
                device=0 if self.device == "cuda" else -1,
                pad_token_id=50256,
                model_kwargs={"cache_dir": cache_path}
            )
            logger.info("Chat model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load chat model: {e}")
            # Fallback to a simpler model
            try:
                self.chat_pipeline = pipeline(
                    "text-generation",
                    model="gpt2",
                    device=0 if self.device == "cuda" else -1,
                    pad_token_id=50256
                )
                logger.info("Fallback chat model (GPT-2) loaded successfully")
            except Exception as e2:
                logger.error(f"Failed to load fallback model: {e2}")
                self.chat_pipeline = None

    def detect_emotion(self, text: str) -> Dict[str, float]:
        """Detect emotions in text using pretrained model"""
        if not self.emotion_model or not self.emotion_tokenizer:
            return {"neutral": 1.0}
        
        try:
            # Tokenize and predict
            inputs = self.emotion_tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                padding=True, 
                max_length=512
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.emotion_model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Convert to probabilities
            emotion_scores = {}
            for i, label in enumerate(self.emotion_labels):
                emotion_scores[label] = float(predictions[0][i])
            
            return emotion_scores
            
        except Exception as e:
            logger.error(f"Error in emotion detection: {e}")
            return {"neutral": 1.0}

    def get_dominant_emotion(self, text: str) -> str:
        """Get the dominant emotion from text"""
        emotion_scores = self.detect_emotion(text)
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        
        # Only return emotion if confidence is above threshold
        if emotion_scores[dominant_emotion] > 0.3:
            return dominant_emotion
        return "neutral"

    def generate_chat_response(self, message: str, context: str = "") -> str:
        """Generate conversational response using pretrained model"""
        if not self.chat_pipeline:
            return self._get_fallback_response(message)
        
        try:
            # Prepare input for the model
            if context:
                input_text = f"{context} {message}"
            else:
                input_text = message
            
            # Generate response
            response = self.chat_pipeline(
                input_text,
                max_length=len(input_text.split()) + 50,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True,
                pad_token_id=50256
            )
            
            generated_text = response[0]['generated_text']
            
            # Extract only the new part (response)
            if len(generated_text) > len(input_text):
                new_response = generated_text[len(input_text):].strip()
                if new_response:
                    return new_response
            
            # Fallback if generation didn't work well
            return self._get_fallback_response(message)
            
        except Exception as e:
            logger.error(f"Error in chat generation: {e}")
            return self._get_fallback_response(message)

    def _get_fallback_response(self, message: str) -> str:
        """Fallback response when model fails"""
        message_lower = message.lower()
        
        # Check for greetings
        if any(greeting in message_lower for greeting in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            return random.choice(self.greeting_responses)
        
        # Check for help requests
        if any(word in message_lower for word in ['help', 'support', 'advice']):
            return random.choice(self.supportive_responses)
        
        # Default responses
        return random.choice([
            "I understand. Tell me more about how you're feeling.",
            "That sounds important to you. Can you share more details?",
            "I'm here to listen. What else would you like to talk about?",
            "Thank you for sharing that with me. How does that make you feel?",
            "I appreciate you opening up. What's the most challenging part about this?"
        ])

    def detect_crisis(self, message: str) -> Dict[str, any]:
        """Detect crisis situations in user messages"""
        message_lower = message.lower()
        crisis_detected = False
        crisis_type = None
        severity = 'low'
        
        # Check for crisis keywords
        for crisis_category, keywords in self.crisis_keywords.items():
            for keyword in keywords:
                if keyword in message_lower:
                    crisis_detected = True
                    crisis_type = crisis_category
                    
                    # Determine severity based on keyword type
                    if crisis_category in ['suicide', 'self_harm', 'violence','die','kill','knife','drown']:
                        severity = 'high'
                    elif crisis_category == 'severe_distress':
                        severity = 'medium'
                    break
            if crisis_detected:
                break
        
        return {
            'crisis_detected': crisis_detected,
            'crisis_type': crisis_type,
            'severity': severity,
            'requires_immediate_help': severity == 'high'
        }

    def generate_crisis_response(self, crisis_info: Dict) -> str:
        """Generate appropriate crisis response"""
        if not crisis_info['crisis_detected']:
            return None
        
        crisis_type = crisis_info['crisis_type']
        severity = crisis_info['severity']
        
        # Start with immediate concern
        response = random.choice(self.crisis_responses['immediate_danger'])
        response += "\n\n"
        
        # Add appropriate resources
        if crisis_type == 'suicide':
            response += self.crisis_responses['crisis_resources']['suicide_prevention']
        elif crisis_type == 'self_harm':
            response += self.crisis_responses['crisis_resources']['self_harm']
        elif crisis_type == 'violence':
            response += self.crisis_responses['crisis_resources']['violence']
        elif crisis_type == 'die':
            response += self.crisis_responses['crisis_resources']['self_harm']
        elif crisis_type == 'kill':
            response += self.crisis_responses['crisis_resources']['violence']
        elif crisis_type == 'knife':
            response += self.crisis_responses['crisis_resources']['violence']
        else:
            response += self.crisis_responses['crisis_resources']['general_crisis']
        
        response += "\n\n"
        
        # Add calming message
        response += random.choice(self.crisis_responses['calming_messages'])
        
        # Add follow-up
        response += "\n\n💙 Please consider reaching out to a trusted friend, family member, or mental health professional. You don't have to face this alone."
        
        return response

    def generate_response(self, message: str, detected_emotion: str = None, user_name: str = None) -> str:
        """Generate contextual response based on message and emotion"""
        
        # PRIORITY: Check for crisis situations first
        crisis_info = self.detect_crisis(message)
        if crisis_info['crisis_detected']:
            logger.warning(f"Crisis detected: {crisis_info}")
            return self.generate_crisis_response(crisis_info)
        
        # Detect emotion if not provided
        if not detected_emotion:
            detected_emotion = self.get_dominant_emotion(message)
        
        message_lower = message.lower()
        
        # Handle greetings
        if any(greeting in message_lower for greeting in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            response = random.choice(self.greeting_responses)
            if user_name:
                response = f"Hi {user_name}! " + response
            return response
        
        # Handle "how to" questions with specific advice
        how_to_response = self._get_how_to_response(message_lower)
        if how_to_response:
            return how_to_response
        
        # Generate emotion-aware response
        if detected_emotion in self.emotion_responses:
            emotion_response = random.choice(self.emotion_responses[detected_emotion])
            
            # Try to get a model-generated response as well
            model_response = self.generate_chat_response(message)
            
            # Combine emotion-aware response with model response
            if len(model_response) > 20 and not any(fallback in model_response.lower() for fallback in ['i understand', 'tell me more']):
                return f"{emotion_response} {model_response}"
            else:
                return emotion_response
        
        # Fallback to model response or default
        model_response = self.generate_chat_response(message)
        return model_response

    def get_mood_insights(self, mood_history: List[Dict]) -> Dict:
        """Analyze mood patterns and provide insights"""
        if not mood_history:
            return {"message": "Start tracking your mood to see insights!"}
        
        mood_counts = {}
        emotion_scores = {}
        
        for entry in mood_history:
            mood = entry['mood']
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
            
            # If we have notes, analyze emotions in them
            if entry.get('notes'):
                emotions = self.detect_emotion(entry['notes'])
                for emotion, score in emotions.items():
                    if emotion not in emotion_scores:
                        emotion_scores[emotion] = []
                    emotion_scores[emotion].append(score)
        
        most_common_mood = max(mood_counts, key=mood_counts.get)
        total_entries = len(mood_history)
        
        # Calculate average emotion scores
        avg_emotions = {}
        for emotion, scores in emotion_scores.items():
            avg_emotions[emotion] = sum(scores) / len(scores)
        
        insights = {
            "total_entries": total_entries,
            "most_common_mood": most_common_mood,
            "mood_distribution": mood_counts,
            "emotion_analysis": avg_emotions,
            "message": f"Over your last {total_entries} entries, you've felt {most_common_mood} most often."
        }
        
        # Add personalized insights
        if avg_emotions:
            dominant_emotion = max(avg_emotions, key=avg_emotions.get)
            if dominant_emotion != 'neutral' and avg_emotions[dominant_emotion] > 0.4:
                insights["emotional_insight"] = f"Your notes often reflect {dominant_emotion}. This might be worth exploring further."
        
        return insights

    def analyze_conversation_sentiment(self, messages: List[str]) -> Dict:
        """Analyze overall sentiment of a conversation"""
        if not messages:
            return {"overall_sentiment": "neutral", "confidence": 0.0}
        
        # Combine all messages
        full_text = " ".join(messages)
        emotions = self.detect_emotion(full_text)
        
        # Calculate overall sentiment
        positive_emotions = emotions.get('joy', 0)
        negative_emotions = emotions.get('sadness', 0) + emotions.get('anger', 0) + emotions.get('fear', 0)
        neutral_emotions = emotions.get('neutral', 0)
        
        if positive_emotions > negative_emotions and positive_emotions > neutral_emotions:
            sentiment = "positive"
            confidence = positive_emotions
        elif negative_emotions > positive_emotions and negative_emotions > neutral_emotions:
            sentiment = "negative"
            confidence = negative_emotions
        else:
            sentiment = "neutral"
            confidence = neutral_emotions
        
        return {
            "overall_sentiment": sentiment,
            "confidence": confidence,
            "emotion_breakdown": emotions
        }

    def _get_how_to_response(self, message_lower: str) -> Optional[str]:
        """Detect and respond to 'how to' questions"""
        if not message_lower.startswith(('how to', 'how do i', 'how can i', 'what can i do')):
            return None
        
        # Map keywords to response categories
        keyword_mapping = {
            'manage_stress': ['stress', 'stressed', 'overwhelmed', 'pressure', 'tension'],
            'improve_mood': ['mood', 'feel better', 'cheer up', 'happier', 'positive'],
            'deal_with_anxiety': ['anxiety', 'anxious', 'worry', 'nervous', 'panic','calm'],
            'sleep_better': ['sleep', 'insomnia', 'rest', 'tired', 'exhausted'],
            'build_confidence': ['confidence', 'self-esteem', 'believe in myself', 'self-worth'],
            'handle_sadness': ['sadness', 'sad', 'depression', 'down', 'blue'],
            'manage_anger': ['anger', 'angry', 'mad', 'frustrated', 'rage']
        }
        
        # Find matching category
        for category, keywords in keyword_mapping.items():
            if any(keyword in message_lower for keyword in keywords):
                return random.choice(self.how_to_responses[category])
        
        # Generic how-to response if no specific match
        return ("I'd be happy to help! For specific guidance on managing emotions, stress, sleep, or building confidence, feel free to ask more detailed questions. "
                "You can also try: 'How to manage stress', 'How to improve my mood', or 'How to deal with anxiety'.")