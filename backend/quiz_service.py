import random
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class QuizService:
    def __init__(self):
        """Initialize the adaptive quiz system"""
        self.quiz_questions = {
            'basic_info': {
                'age_group': {
                    'question': 'What is your age group?',
                    'type': 'single_choice',
                    'options': ['18-20', '21-23', '24+'],
                    'required': True
                },
                'year_of_study': {
                    'question': 'What year of study are you in?',
                    'type': 'single_choice',
                    'options': ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate'],
                    'required': True
                },
                'living_situation': {
                    'question': 'What is your current living situation?',
                    'type': 'single_choice',
                    'options': ['Hostel', 'With family', 'Rented accommodation', 'Living alone'],
                    'required': True
                }
            },
            'main_concerns': {
                'concern_selection': {
                    'question': 'What is your main area of concern? (Select all that apply)',
                    'type': 'multiple_choice',
                    'options': [
                        'Stress & Academic Pressure',
                        'Anxiety / Worry',
                        'Low Mood / Sadness',
                        'Sleep Problems',
                        'Other'
                    ],
                    'required': True
                }
            },
            'stress_academic': {
                'level_1': [
                    {
                        'id': 'stress_overwhelmed',
                        'question': 'Do you often feel overwhelmed by your studies?',
                        'type': 'yes_no',
                        'weight': 2
                    },
                    {
                        'id': 'stress_deadlines',
                        'question': 'Do deadlines or exams cause you too much tension?',
                        'type': 'yes_no',
                        'weight': 2
                    }
                ],
                'level_2': [
                    {
                        'id': 'stress_frequency',
                        'question': 'How many days in a week do you feel stressed?',
                        'type': 'scale',
                        'scale': [0, 1, 2, 3, 4, 5, 6, 7],
                        'weight': 1
                    },
                    {
                        'id': 'stress_balance',
                        'question': 'Do you find it hard to balance study, sleep, and free time?',
                        'type': 'frequency',
                        'options': ['Never', 'Sometimes', 'Often', 'Always'],
                        'weight': 1
                    },
                    {
                        'id': 'stress_triggers',
                        'question': 'What usually triggers your stress?',
                        'type': 'multiple_choice',
                        'options': ['Exams', 'Assignments', 'Time management', 'Social pressure', 'Financial concerns', 'Other'],
                        'weight': 0
                    }
                ],
                'level_3': [
                    {
                        'id': 'stress_academic_impact',
                        'question': 'How much is stress affecting your academic performance?',
                        'type': 'impact',
                        'options': ['Not at all', 'A little', 'Moderately', 'A lot'],
                        'weight': 2
                    },
                    {
                        'id': 'stress_physical',
                        'question': 'Do you face physical symptoms due to stress (headache, tiredness, lack of sleep)?',
                        'type': 'yes_no',
                        'weight': 1
                    },
                    {
                        'id': 'stress_support',
                        'question': 'What would help you most?',
                        'type': 'single_choice',
                        'options': ['Self-help tips', 'Time management tools', 'Talk to a counselor', 'Peer support', 'Professional help'],
                        'weight': 0
                    }
                ]
            },
            'anxiety_worry': {
                'level_1': [
                    {
                        'id': 'anxiety_nervous',
                        'question': 'Do you often feel nervous or worried?',
                        'type': 'yes_no',
                        'weight': 2
                    },
                    {
                        'id': 'anxiety_overthink',
                        'question': 'Do small problems make you overthink a lot?',
                        'type': 'yes_no',
                        'weight': 2
                    }
                ],
                'level_2': [
                    {
                        'id': 'anxiety_frequency',
                        'question': 'How often do you feel anxious in a week?',
                        'type': 'frequency',
                        'options': ['Rarely', 'Sometimes', 'Often', 'Almost daily'],
                        'weight': 2
                    },
                    {
                        'id': 'anxiety_relax',
                        'question': 'Do you find it hard to relax when you\'re worried?',
                        'type': 'yes_no',
                        'weight': 1
                    },
                    {
                        'id': 'anxiety_triggers',
                        'question': 'What situations make you anxious?',
                        'type': 'multiple_choice',
                        'options': ['Exams', 'Social interactions', 'Future plans', 'Public speaking', 'Meeting new people', 'Other'],
                        'weight': 0
                    }
                ],
                'level_3': [
                    {
                        'id': 'anxiety_avoidance',
                        'question': 'Does anxiety stop you from attending classes or focusing on work?',
                        'type': 'frequency',
                        'options': ['Never', 'Sometimes', 'Often', 'Always'],
                        'weight': 2
                    },
                    {
                        'id': 'anxiety_physical',
                        'question': 'Do you feel physical symptoms like sweating, fast heartbeat, or panic?',
                        'type': 'yes_no',
                        'weight': 2
                    },
                    {
                        'id': 'anxiety_support',
                        'question': 'What type of support would you prefer?',
                        'type': 'single_choice',
                        'options': ['Breathing/relaxation exercises', 'Peer support', 'Professional counseling', 'Self-help resources', 'Medication consultation'],
                        'weight': 0
                    }
                ]
            },
            'low_mood_sadness': {
                'level_1': [
                    {
                        'id': 'mood_sad_interest',
                        'question': 'Do you often feel sad or lose interest in daily activities?',
                        'type': 'yes_no',
                        'weight': 3
                    },
                    {
                        'id': 'mood_duration',
                        'question': 'Have you been feeling low for more than 2 weeks?',
                        'type': 'yes_no',
                        'weight': 3
                    }
                ],
                'level_2': [
                    {
                        'id': 'mood_energy',
                        'question': 'Do you feel tired or low on energy most days?',
                        'type': 'yes_no',
                        'weight': 2
                    },
                    {
                        'id': 'mood_concentration',
                        'question': 'Do you face trouble concentrating on studies?',
                        'type': 'yes_no',
                        'weight': 2
                    },
                    {
                        'id': 'mood_self_negative',
                        'question': 'Do you feel negative about yourself?',
                        'type': 'yes_no',
                        'weight': 2
                    }
                ],
                'level_3': [
                    {
                        'id': 'mood_impact',
                        'question': 'How much is sadness affecting your studies or relationships?',
                        'type': 'impact',
                        'options': ['Not at all', 'A little', 'Moderately', 'A lot'],
                        'weight': 2
                    },
                    {
                        'id': 'mood_suicidal',
                        'question': 'Do you sometimes feel life is not worth living?',
                        'type': 'frequency',
                        'options': ['Never', 'Sometimes', 'Often', 'Very often'],
                        'weight': 5,  # Critical weight
                        'critical': True
                    },
                    {
                        'id': 'mood_support',
                        'question': 'What type of support would be most helpful?',
                        'type': 'single_choice',
                        'options': ['Motivational resources', 'Peer support groups', 'Professional counseling', 'Self-help tools', 'Crisis intervention'],
                        'weight': 0
                    }
                ]
            },
            'sleep_problems': {
                'level_1': [
                    {
                        'id': 'sleep_falling_asleep',
                        'question': 'Do you often have trouble falling asleep?',
                        'type': 'yes_no',
                        'weight': 2
                    },
                    {
                        'id': 'sleep_wake_unrested',
                        'question': 'Do you wake up frequently at night or feel unrested?',
                        'type': 'yes_no',
                        'weight': 2
                    }
                ],
                'level_2': [
                    {
                        'id': 'sleep_hours',
                        'question': 'How many hours of sleep do you usually get?',
                        'type': 'single_choice',
                        'options': ['Less than 4 hours', '4-6 hours', '6-8 hours', 'More than 8 hours'],
                        'weight': 1
                    },
                    {
                        'id': 'sleep_screen_time',
                        'question': 'Do you use your phone or laptop late at night?',
                        'type': 'yes_no',
                        'weight': 1
                    },
                    {
                        'id': 'sleep_next_day_focus',
                        'question': 'Do sleep problems affect your next-day focus?',
                        'type': 'yes_no',
                        'weight': 2
                    }
                ],
                'level_3': [
                    {
                        'id': 'sleep_impact',
                        'question': 'How badly are sleep issues affecting your studies or mood?',
                        'type': 'impact',
                        'options': ['Not at all', 'A little', 'Moderately', 'A lot'],
                        'weight': 2
                    },
                    {
                        'id': 'sleep_remedies_tried',
                        'question': 'Have you tried remedies like reducing caffeine, meditation, or exercise?',
                        'type': 'yes_no',
                        'weight': 0
                    },
                    {
                        'id': 'sleep_support',
                        'question': 'What would you prefer for better sleep?',
                        'type': 'single_choice',
                        'options': ['Sleep hygiene tips', 'Relaxation techniques', 'Professional consultation', 'Sleep tracking tools', 'Lifestyle changes'],
                        'weight': 0
                    }
                ]
            }
        }
        
        # Scoring thresholds for each category
        self.severity_thresholds = {
            'mild': (0, 4),
            'moderate': (5, 8),
            'severe': (9, float('inf'))
        }

    def start_quiz(self, user_id: int) -> Dict:
        """Start a new quiz session"""
        return {
            'user_id': user_id,
            'current_section': 'basic_info',
            'current_level': 1,
            'responses': {},
            'scores': {},
            'completed_sections': [],
            'quiz_id': f"quiz_{user_id}_{int(datetime.now().timestamp())}"
        }

    def get_next_question(self, quiz_state: Dict) -> Optional[Dict]:
        """Get the next question based on current quiz state"""
        current_section = quiz_state['current_section']
        current_level = quiz_state['current_level']
        
        if current_section == 'basic_info':
            return self._get_basic_info_question(quiz_state)
        elif current_section == 'main_concerns':
            return self._get_main_concerns_question(quiz_state)
        else:
            return self._get_concern_specific_question(quiz_state, current_section, current_level)

    def _get_basic_info_question(self, quiz_state: Dict) -> Optional[Dict]:
        """Get basic information questions"""
        basic_questions = list(self.quiz_questions['basic_info'].keys())
        basic_responses = quiz_state['responses'].get('basic_info', {})
        answered_questions = [q for q in basic_questions if q in basic_responses]
        
        if len(answered_questions) < len(basic_questions):
            next_question_key = basic_questions[len(answered_questions)]
            question_data = self.quiz_questions['basic_info'][next_question_key]
            
            return {
                'question_id': next_question_key,
                'question': question_data['question'],
                'type': question_data['type'],
                'options': question_data.get('options', []),
                'required': question_data.get('required', False),
                'section': 'basic_info'
            }
        
        # Move to main concerns
        quiz_state['current_section'] = 'main_concerns'
        quiz_state['completed_sections'].append('basic_info')
        return self.get_next_question(quiz_state)

    def _get_main_concerns_question(self, quiz_state: Dict) -> Optional[Dict]:
        """Get main concerns selection question"""
        main_concerns_responses = quiz_state['responses'].get('main_concerns', {})
        if 'concern_selection' not in main_concerns_responses:
            question_data = self.quiz_questions['main_concerns']['concern_selection']
            return {
                'question_id': 'concern_selection',
                'question': question_data['question'],
                'type': question_data['type'],
                'options': question_data['options'],
                'required': question_data['required'],
                'section': 'main_concerns'
            }
        
        # Move to first selected concern
        selected_concerns = main_concerns_responses['concern_selection']
        concern_mapping = {
            'Stress & Academic Pressure': 'stress_academic',
            'Anxiety / Worry': 'anxiety_worry',
            'Low Mood / Sadness': 'low_mood_sadness',
            'Sleep Problems': 'sleep_problems'
        }
        
        for concern in selected_concerns:
            if concern in concern_mapping:
                concern_key = concern_mapping[concern]
                if concern_key not in quiz_state['completed_sections']:
                    quiz_state['current_section'] = concern_key
                    quiz_state['current_level'] = 1
                    quiz_state['completed_sections'].append('main_concerns')
                    return self.get_next_question(quiz_state)
        
        # All concerns completed
        return None

    def _get_concern_specific_question(self, quiz_state: Dict, section: str, level: int) -> Optional[Dict]:
        """Get questions for specific concern areas"""
        if section not in self.quiz_questions:
            return None
        
        level_key = f'level_{level}'
        if level_key not in self.quiz_questions[section]:
            # Move to next concern or complete quiz
            return self._move_to_next_concern(quiz_state)
        
        questions = self.quiz_questions[section][level_key]
        section_responses = quiz_state['responses'].get(section, {})
        
        # Find next unanswered question in current level
        for question in questions:
            if question['id'] not in section_responses:
                return {
                    'question_id': question['id'],
                    'question': question['question'],
                    'type': question['type'],
                    'options': question.get('options', []),
                    'scale': question.get('scale', []),
                    'weight': question.get('weight', 1),
                    'critical': question.get('critical', False),
                    'section': section,
                    'level': level
                }
        
        # All questions in current level answered, check if we should proceed to next level
        if self._should_proceed_to_next_level(quiz_state, section, level):
            quiz_state['current_level'] = level + 1
            return self.get_next_question(quiz_state)
        else:
            # Move to next concern
            return self._move_to_next_concern(quiz_state)

    def _should_proceed_to_next_level(self, quiz_state: Dict, section: str, level: int) -> bool:
        """Determine if user should proceed to next level based on responses"""
        if level >= 3:  # Max 3 levels
            return False
        
        section_responses = quiz_state['responses'].get(section, {})
        level_questions = self.quiz_questions[section][f'level_{level}']
        
        # Calculate score for current level
        score = 0
        for question in level_questions:
            if question['id'] in section_responses:
                response = section_responses[question['id']]
                question_score = self._calculate_question_score(question, response)
                score += question_score * question.get('weight', 1)
        
        # Proceed if score indicates potential issues (threshold: 2 for level 1, 3 for level 2)
        threshold = 2 if level == 1 else 3
        return score >= threshold

    def _move_to_next_concern(self, quiz_state: Dict) -> Optional[Dict]:
        """Move to the next selected concern"""
        quiz_state['completed_sections'].append(quiz_state['current_section'])
        
        main_concerns_responses = quiz_state['responses'].get('main_concerns', {})
        selected_concerns = main_concerns_responses.get('concern_selection', [])
        concern_mapping = {
            'Stress & Academic Pressure': 'stress_academic',
            'Anxiety / Worry': 'anxiety_worry',
            'Low Mood / Sadness': 'low_mood_sadness',
            'Sleep Problems': 'sleep_problems'
        }
        
        for concern in selected_concerns:
            if concern in concern_mapping:
                concern_key = concern_mapping[concern]
                if concern_key not in quiz_state['completed_sections']:
                    quiz_state['current_section'] = concern_key
                    quiz_state['current_level'] = 1
                    return self.get_next_question(quiz_state)
        
        # All concerns completed
        return None

    def submit_answer(self, quiz_state: Dict, question_id: str, answer: any) -> Dict:
        """Submit an answer and update quiz state"""
        current_section = quiz_state['current_section']
        
        # Initialize section responses if not exists
        if current_section not in quiz_state['responses']:
            quiz_state['responses'][current_section] = {}
        
        # Store the response
        quiz_state['responses'][current_section][question_id] = answer
        
        # Check for critical responses
        if self._is_critical_response(current_section, question_id, answer):
            quiz_state['critical_flag'] = True
            quiz_state['critical_type'] = self._get_critical_type(current_section, question_id)
        
        return quiz_state

    def _is_critical_response(self, section: str, question_id: str, answer: any) -> bool:
        """Check if response indicates critical situation"""
        critical_responses = {
            'mood_suicidal': ['Often', 'Very often'],
            'anxiety_physical': True,  # If yes to panic symptoms
            'mood_impact': ['A lot'],
            'stress_physical': True  # If yes to severe physical symptoms
        }
        
        if question_id in critical_responses:
            expected = critical_responses[question_id]
            if isinstance(expected, list):
                return answer in expected
            elif isinstance(expected, bool):
                return answer == expected
        
        return False

    def _get_critical_type(self, section: str, question_id: str) -> str:
        """Get the type of critical situation"""
        if 'suicidal' in question_id:
            return 'suicidal_ideation'
        elif section == 'anxiety_worry':
            return 'severe_anxiety'
        elif section == 'low_mood_sadness':
            return 'severe_depression'
        else:
            return 'severe_distress'

    def _calculate_question_score(self, question: Dict, response: any) -> int:
        """Calculate score for a specific question response"""
        question_type = question['type']
        
        if question_type == 'yes_no':
            return 2 if response else 0
        elif question_type == 'frequency':
            frequency_scores = {'Never': 0, 'Sometimes': 1, 'Often': 2, 'Always': 3, 'Rarely': 0, 'Almost daily': 3, 'Very often': 3}
            return frequency_scores.get(response, 0)
        elif question_type == 'impact':
            impact_scores = {'Not at all': 0, 'A little': 1, 'Moderately': 2, 'A lot': 3}
            return impact_scores.get(response, 0)
        elif question_type == 'scale':
            if isinstance(response, (int, float)):
                return min(int(response), 3)  # Cap at 3
        elif question_type in ['single_choice', 'multiple_choice']:
            # Some choices might have implicit severity
            if 'severe' in str(response).lower() or 'a lot' in str(response).lower():
                return 2
            elif 'moderate' in str(response).lower() or 'sometimes' in str(response).lower():
                return 1
        
        return 0

    def calculate_final_scores(self, quiz_state: Dict) -> Dict:
        """Calculate final scores and severity levels for each concern"""
        scores = {}
        main_concerns_responses = quiz_state['responses'].get('main_concerns', {})
        selected_concerns = main_concerns_responses.get('concern_selection', [])
        
        concern_mapping = {
            'Stress & Academic Pressure': 'stress_academic',
            'Anxiety / Worry': 'anxiety_worry',
            'Low Mood / Sadness': 'low_mood_sadness',
            'Sleep Problems': 'sleep_problems'
        }
        
        for concern in selected_concerns:
            if concern in concern_mapping:
                section_key = concern_mapping[concern]
                if section_key in quiz_state['responses']:
                    section_score = self._calculate_section_score(quiz_state, section_key)
                    severity = self._determine_severity(section_score)
                    
                    scores[concern] = {
                        'score': section_score,
                        'severity': severity,
                        'recommendations': self._get_recommendations(concern, severity, quiz_state.get('critical_flag', False))
                    }
        
        return scores

    def _calculate_section_score(self, quiz_state: Dict, section: str) -> int:
        """Calculate total score for a section"""
        total_score = 0
        section_responses = quiz_state['responses'].get(section, {})
        
        if section not in self.quiz_questions:
            return 0
        
        # Sum scores from all levels
        for level in range(1, 4):
            level_key = f'level_{level}'
            if level_key in self.quiz_questions[section]:
                questions = self.quiz_questions[section][level_key]
                for question in questions:
                    if question['id'] in section_responses:
                        response = section_responses[question['id']]
                        question_score = self._calculate_question_score(question, response)
                        total_score += question_score * question.get('weight', 1)
        
        return total_score

    def _determine_severity(self, score: int) -> str:
        """Determine severity level based on score"""
        if score <= self.severity_thresholds['mild'][1]:
            return 'mild'
        elif score <= self.severity_thresholds['moderate'][1]:
            return 'moderate'
        else:
            return 'severe'

    def _get_recommendations(self, concern: str, severity: str, critical_flag: bool) -> List[str]:
        """Get recommendations based on concern type and severity"""
        if critical_flag:
            return [
                "🚨 Your responses indicate you may need immediate professional support.",
                "Please consider contacting a mental health professional or crisis helpline.",
                "National Suicide Prevention Lifeline: 988",
                "Crisis Text Line: Text HOME to 741741",
                "You are not alone - help is available."
            ]
        
        recommendations = {
            'Stress & Academic Pressure': {
                'mild': [
                    "Try time management techniques like the Pomodoro method",
                    "Practice deep breathing exercises during stressful moments",
                    "Create a study schedule with regular breaks",
                    "Consider light physical exercise to reduce stress"
                ],
                'moderate': [
                    "Implement structured stress management techniques",
                    "Consider joining study groups for peer support",
                    "Practice mindfulness or meditation daily",
                    "Speak with academic advisors about workload management",
                    "Consider counseling services if available"
                ],
                'severe': [
                    "Seek professional counseling or therapy",
                    "Contact your institution's mental health services",
                    "Consider temporary academic accommodations",
                    "Involve trusted friends or family in your support system",
                    "Professional stress management therapy may be beneficial"
                ]
            },
            'Anxiety / Worry': {
                'mild': [
                    "Practice grounding techniques (5-4-3-2-1 method)",
                    "Try progressive muscle relaxation",
                    "Limit caffeine intake",
                    "Maintain regular sleep schedule"
                ],
                'moderate': [
                    "Learn cognitive behavioral techniques for anxiety",
                    "Consider anxiety management apps or guided meditations",
                    "Join anxiety support groups",
                    "Practice exposure therapy for specific fears",
                    "Consider counseling for anxiety management"
                ],
                'severe': [
                    "Seek professional mental health treatment",
                    "Consider therapy (CBT, DBT) for anxiety disorders",
                    "Consult with a psychiatrist about treatment options",
                    "Implement comprehensive anxiety management plan",
                    "Consider medication evaluation if appropriate"
                ]
            },
            'Low Mood / Sadness': {
                'mild': [
                    "Engage in regular physical activity",
                    "Maintain social connections",
                    "Practice gratitude journaling",
                    "Ensure adequate sunlight exposure"
                ],
                'moderate': [
                    "Consider counseling or therapy",
                    "Join support groups for mood management",
                    "Implement behavioral activation techniques",
                    "Monitor mood patterns and triggers",
                    "Consider professional mental health evaluation"
                ],
                'severe': [
                    "Seek immediate professional mental health treatment",
                    "Consider therapy for depression (CBT, IPT)",
                    "Consult with a psychiatrist for comprehensive evaluation",
                    "Develop safety plan with mental health professional",
                    "Consider intensive outpatient or inpatient treatment if needed"
                ]
            },
            'Sleep Problems': {
                'mild': [
                    "Maintain consistent sleep schedule",
                    "Create relaxing bedtime routine",
                    "Limit screen time before bed",
                    "Keep bedroom cool and dark"
                ],
                'moderate': [
                    "Implement comprehensive sleep hygiene practices",
                    "Consider sleep tracking and analysis",
                    "Try relaxation techniques before bed",
                    "Evaluate and modify evening habits",
                    "Consider brief counseling for sleep issues"
                ],
                'severe': [
                    "Consult with sleep specialist or physician",
                    "Consider sleep study evaluation",
                    "Explore underlying medical or psychological causes",
                    "Consider cognitive behavioral therapy for insomnia (CBT-I)",
                    "Professional sleep disorder treatment may be needed"
                ]
            }
        }
        
        return recommendations.get(concern, {}).get(severity, ["Consider speaking with a healthcare professional for personalized advice."])

    def generate_quiz_summary(self, quiz_state: Dict, final_scores: Dict) -> Dict:
        """Generate comprehensive quiz summary"""
        basic_info = quiz_state['responses'].get('basic_info', {})
        main_concerns_responses = quiz_state['responses'].get('main_concerns', {})
        selected_concerns = main_concerns_responses.get('concern_selection', [])
        
        summary = {
            'quiz_id': quiz_state['quiz_id'],
            'user_id': quiz_state['user_id'],
            'completion_date': datetime.now().isoformat(),
            'basic_info': basic_info,
            'main_concerns': selected_concerns,
            'scores': final_scores,
            'overall_severity': self._determine_overall_severity(final_scores),
            'critical_flag': quiz_state.get('critical_flag', False),
            'critical_type': quiz_state.get('critical_type'),
            'primary_recommendations': self._get_primary_recommendations(final_scores, quiz_state.get('critical_flag', False)),
            'suggested_mood': self._suggest_primary_mood(final_scores)
        }
        
        return summary

    def _determine_overall_severity(self, final_scores: Dict) -> str:
        """Determine overall severity across all concerns"""
        if not final_scores:
            return 'mild'
        
        severity_levels = [score_data['severity'] for score_data in final_scores.values()]
        
        if 'severe' in severity_levels:
            return 'severe'
        elif 'moderate' in severity_levels:
            return 'moderate'
        else:
            return 'mild'

    def _get_primary_recommendations(self, final_scores: Dict, critical_flag: bool) -> List[str]:
        """Get primary recommendations across all concerns"""
        if critical_flag:
            return [
                "🚨 Immediate professional support recommended",
                "Contact crisis helpline or emergency services",
                "Reach out to trusted friends, family, or counselors",
                "You are not alone - help is available"
            ]
        
        all_recommendations = []
        for concern_data in final_scores.values():
            all_recommendations.extend(concern_data['recommendations'][:2])  # Top 2 from each
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for rec in all_recommendations:
            if rec not in seen:
                seen.add(rec)
                unique_recommendations.append(rec)
        
        return unique_recommendations[:6]  # Top 6 overall

    def _suggest_primary_mood(self, final_scores: Dict) -> str:
        """Suggest primary mood based on quiz results"""
        if not final_scores:
            return 'neutral'
        
        # Map concerns to moods
        concern_mood_mapping = {
            'Stress & Academic Pressure': 'stressed',
            'Anxiety / Worry': 'anxious',
            'Low Mood / Sadness': 'sad',
            'Sleep Problems': 'tired'
        }
        
        # Find highest severity concern
        highest_severity_concern = None
        highest_score = -1
        
        for concern, data in final_scores.items():
            if data['score'] > highest_score:
                highest_score = data['score']
                highest_severity_concern = concern
        
        if highest_severity_concern and highest_severity_concern in concern_mood_mapping:
            return concern_mood_mapping[highest_severity_concern]
        
        return 'neutral'