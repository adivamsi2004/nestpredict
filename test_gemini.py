import os
import google.generativeai as genai
from dotenv import load_dotenv

# Try different paths for .env
load_dotenv('.env')
if not os.getenv("GEMINI_API_KEY"):
    load_dotenv('../Backend/.env')
if not os.getenv("GEMINI_API_KEY"):
    load_dotenv('Backend/.env')

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print(f"API Key not found! Current directory: {os.getcwd()}")
else:
    print(f"API Key found: {GEMINI_API_KEY[:10]}...")
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("What is the price of a 1000 sq ft house in India in INR? Give me one average number only.")
        print(f"Gemini Response: {response.text}")
    except Exception as e:
        print(f"Gemini Error: {e}")
