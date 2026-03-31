import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('.env')
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("API Key not found!")
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print("Listing available models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error listing models: {e}")
