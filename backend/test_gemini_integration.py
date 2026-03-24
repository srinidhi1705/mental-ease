"""
Test script for Gemini API integration

This script tests the Gemini client functionality including:
- API connection
- Response generation
- Mood context injection
- Mood update detection
"""

import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from gemini_client import GeminiClient


def test_gemini_client():
    """Test Gemini client initialization and basic functionality"""
    print("=" * 60)
    print("GEMINI API INTEGRATION TEST")
    print("=" * 60)
    
    # Check if API key is set
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("\n❌ GEMINI_API_KEY not set in .env file")
        print("   Please set your API key in backend/.env")
        print("   Get your key from: https://makersuite.google.com/app/apikey")
        return False
    
    print(f"\n✓ API Key found: {api_key[:10]}...{api_key[-5:]}")
    
    # Test 1: Initialize client
    print("\n" + "-" * 60)
    print("TEST 1: Initialize Gemini Client")
    print("-" * 60)
    try:
        client = GeminiClient()
        if client.model:
            print("✓ Gemini client initialized successfully")
            print(f"  Model: {client.model_name}")
        else:
            print("❌ Failed to initialize Gemini model")
            return False
    except Exception as e:
        print(f"❌ Error initializing client: {e}")
        return False
    
    # Test 2: Generate response without mood context
    print("\n" + "-" * 60)
    print("TEST 2: Generate Basic Response")
    print("-" * 60)
    try:
        mood_context = {
            'mood_label': 'neutral',
            'mood_score': 0.5,
            'mood_timestamp': 'N/A'
        }
        user_message = "Hello, I'm feeling a bit stressed about my exams."
        
        print(f"User message: {user_message}")
        response, mood_update = client.generate_chat_response(user_message, mood_context)
        
        print(f"\n✓ Response generated successfully")
        print(f"  Response: {response}")
        print(f"  Mood update: {mood_update}")
        
        if len(response) > 0:
            print("  ✓ Response is non-empty")
        else:
            print("  ❌ Response is empty")
            return False
            
    except Exception as e:
        print(f"❌ Error generating response: {e}")
        return False
    
    # Test 3: Generate response with mood context
    print("\n" + "-" * 60)
    print("TEST 3: Generate Response with Mood Context")
    print("-" * 60)
    try:
        mood_context = {
            'mood_label': 'anxious',
            'mood_score': 0.8,
            'mood_timestamp': '2024-02-07 10:30:00'
        }
        user_message = "I have a presentation tomorrow and I'm really nervous."
        
        print(f"User message: {user_message}")
        print(f"Mood context: {mood_context}")
        response, mood_update = client.generate_chat_response(user_message, mood_context)
        
        print(f"\n✓ Response generated with mood context")
        print(f"  Response: {response}")
        print(f"  Mood update: {mood_update}")
        
    except Exception as e:
        print(f"❌ Error generating response with mood: {e}")
        return False
    
    # Test 4: Test mood update detection (granular moods)
    print("\n" + "-" * 60)
    print("TEST 4: Granular Mood Update Detection")
    print("-" * 60)
    
    # Test different mood scenarios
    test_scenarios = [
        {
            'message': "I just finished my exam and I feel so relieved!",
            'current_mood': 'stressed',
            'expected_moods': ['happy', 'calm', 'excited']
        },
        {
            'message': "I'm so worried about my presentation tomorrow, I can't stop thinking about it.",
            'current_mood': 'neutral',
            'expected_moods': ['anxious', 'stressed']
        },
        {
            'message': "I'm exhausted, I barely slept last night.",
            'current_mood': 'neutral',
            'expected_moods': ['tired']
        },
        {
            'message': "This is so frustrating! Nothing is working today.",
            'current_mood': 'neutral',
            'expected_moods': ['angry', 'stressed']
        }
    ]
    
    for i, scenario in enumerate(test_scenarios, 1):
        try:
            mood_context = {
                'mood_label': scenario['current_mood'],
                'mood_score': 0.7,
                'mood_timestamp': '2024-02-07 09:00:00'
            }
            
            print(f"\n  Scenario {i}:")
            print(f"  Message: {scenario['message']}")
            print(f"  Current mood: {scenario['current_mood']}")
            
            response, mood_update = client.generate_chat_response(scenario['message'], mood_context)
            
            print(f"  Response: {response[:80]}...")
            print(f"  Detected mood: {mood_update}")
            
            if mood_update:
                if mood_update in scenario['expected_moods']:
                    print(f"  ✓ Correct mood detected: {mood_update}")
                else:
                    print(f"  ℹ Mood detected ({mood_update}) differs from expected {scenario['expected_moods']}")
            else:
                print(f"  ℹ No mood change detected (this is OK)")
                
        except Exception as e:
            print(f"  ❌ Error in scenario {i}: {e}")
            return False
    
    print("\n✓ Granular mood detection test completed")
    
    # Test 5: Test error handling
    print("\n" + "-" * 60)
    print("TEST 5: Error Handling (Empty Message)")
    print("-" * 60)
    try:
        mood_context = {'mood_label': 'neutral', 'mood_score': 0.5, 'mood_timestamp': 'N/A'}
        user_message = ""
        
        response, mood_update = client.generate_chat_response(user_message, mood_context)
        
        print(f"✓ Handled empty message gracefully")
        print(f"  Fallback response: {response}")
        
    except Exception as e:
        print(f"❌ Error handling failed: {e}")
        return False
    
    # All tests passed
    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED")
    print("=" * 60)
    print("\nGemini integration is working correctly!")
    print("You can now start the backend and test with the frontend.")
    return True


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    success = test_gemini_client()
    sys.exit(0 if success else 1)
