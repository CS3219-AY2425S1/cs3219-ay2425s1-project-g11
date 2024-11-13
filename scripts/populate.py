import json
import requests
import time
from typing import Dict, List
import os

# Configuration
API_URL = "http://localhost:8001/api/v1/questions"  # Update this with your actual API endpoint
QUESTIONS_FILE = "questions.json"
PROGRESS_FILE = "population_progress.json"
# Add your JWT token here
JWT_TOKEN = ""  # Replace with actual admin JWT token

def load_questions() -> List[Dict]:
    """Load questions from JSON file."""
    with open(QUESTIONS_FILE, 'r') as f:
        return json.load(f)

def format_question(question: Dict) -> Dict:
    """Format question data for API payload."""
    return {
        "difficulty": question["difficulty"],
        "description": question["description"],
        "examples": question["examples"],
        "constraints": question["constraints"],
        "tags": question["tags"],
        "title_slug": question["title-slug"],
        "title": question["title"]
    }

def load_progress() -> List[str]:
    """Load previously populated question titles."""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_progress(completed_questions: List[str]):
    """Save progress of populated questions."""
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(completed_questions, f)

def populate_questions():
    """Main function to populate questions."""
    questions = load_questions()
    completed_questions = load_progress()
    success_count = 0
    failure_count = 0
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {JWT_TOKEN}'
    }
    
    remaining_questions = [q for q in questions if q['title'] not in completed_questions]
    print(f"Found {len(remaining_questions)} questions to process")
    print(f"Skipping {len(completed_questions)} previously completed questions")
    
    for question in remaining_questions:
        try:
            payload = format_question(question)
            response = requests.post(API_URL, json=payload, headers=headers)
            
            if response.status_code == 201 or response.status_code == 200:
                print(f"✅ Successfully added question: {question['title']}")
                completed_questions.append(question['title'])
                save_progress(completed_questions)  # Save progress after each successful addition
                success_count += 1
            else:
                print(f"❌ Failed to add question: {question['title']}")
                print(f"Status code: {response.status_code}")
                print(f"Response: {response.text}")
                failure_count += 1
                
        except Exception as e:
            print(f"❌ Error adding question {question['title']}: {str(e)}")
            failure_count += 1
    
    print("\nPopulation complete!")
    print(f"Successfully added: {success_count} questions")
    print(f"Failed to add: {failure_count} questions")
    print(f"Total questions processed so far: {len(completed_questions)}")

if __name__ == "__main__":
    populate_questions()
