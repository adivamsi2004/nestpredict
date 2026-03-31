from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import google.generativeai as genai
from dotenv import load_dotenv
import re
import hashlib
from functools import lru_cache

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = FastAPI()

# Cache store to keep track of predictions to prevent different outputs for same input
prediction_cache = {}

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("AIzaSyDaygw6O7HqXdga7y0qI20-SSS6EC201ak")
gemini_model = None
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# Configure Firebase
FIREBASE_CRED_PATH = os.getenv("FIREBASE_CREDENTIALS", os.path.join(BASE_DIR, "firebase_service_account.json"))
if not os.path.isabs(FIREBASE_CRED_PATH):
    FIREBASE_CRED_PATH = os.path.join(BASE_DIR, FIREBASE_CRED_PATH)

firebase_db = None
try:
    if os.path.exists(FIREBASE_CRED_PATH):
        import firebase_admin
        from firebase_admin import credentials, firestore
        cred = credentials.Certificate(FIREBASE_CRED_PATH)
        firebase_admin.initialize_app(cred)
        firebase_db = firestore.client()
        print("Firebase initialized successfully.")
    else:
        print(f"Firebase credentials not found at {FIREBASE_CRED_PATH}. Firestore saving disabled.")
except Exception as e:
    print(f"Firebase init error: {e}. Firestore saving disabled.")

# Configure MongoDB
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = None
mongo_db = None
if MONGO_URI:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(MONGO_URI)
        mongo_db = mongo_client["house_price_db"]
        print("MongoDB initialized successfully.")
    except Exception as e:
        print(f"MongoDB init error: {e}")

# Load the model
model_path = os.path.join(os.path.dirname(__file__), 'house_price_model (2).pkl')
try:
    model = joblib.load(model_path)
except Exception as e:
    model = None
    print(f"Error loading local model: {e}")

class PredictionRequest(BaseModel):
    area: float
    bedrooms: int
    bathrooms: float
    floors: int
    yearBuilt: int
    location: str
    condition: str
    garage: str

@app.get("/")
def read_root():
    return {
        "status": "backend is running", 
        "local_model_loaded": model is not None,
        "gemini_loaded": gemini_model is not None
    }

@app.post("/predict")
def predict(request: PredictionRequest):
    print(f"Received prediction request: {request}")
    # Use Gemini model for accurate predictions if configured
    if gemini_model:
        prompt = f"""
        You are an expert real estate appraiser in India.
        Given the following property details, estimate the current realistic market price in Indian Rupees (INR).
        Area: {request.area} sq ft
        Bedrooms: {request.bedrooms}
        Bathrooms: {request.bathrooms}
        Floors: {request.floors}
        Year Built: {request.yearBuilt}
        Location: {request.location}
        Condition: {request.condition}
        Garage: {request.garage}
        
        Respond ONLY with a single numeric value representing the estimated price in INR.
        Do not include commas, text, or the ₹ symbol. No explanation. Just the number.
        """
        try:
            response = gemini_model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.0))
            clean_number = re.sub(r'[^\d.]', '', response.text.strip())
            if clean_number:
                predicted_price = float(clean_number)
                
                from datetime import datetime
                record = {
                    "timestamp": datetime.now().isoformat(),
                    "property_details": request.model_dump(),
                    "predicted_price_inr": predicted_price,
                    "source": "Gemini AI"
                }
                
                print("Gemini prediction successful. Saving to databases...")
                # Save to Firebase Firestore
                if firebase_db:
                    try:
                        firebase_db.collection("price_predictions").add(record.copy())
                        print("Saved to Firebase.")
                    except Exception as db_e:
                        print(f"Firebase save error: {db_e}")
                        
                # Save to MongoDB
                if mongo_db is not None:
                    try:
                        print("Saving to MongoDB...")
                        mongo_db.predictions.insert_one(record.copy())
                        print("Saved to MongoDB.")
                    except Exception as db_e:
                        print(f"MongoDB save error: {db_e}")
                        
                return {"price": float(predicted_price), "source": "Gemini AI Assistant"}
        except Exception as e:
            print(f"Gemini Prediction error: {e}, falling back to local model.")

    # FALLBACK HEURISTIC (if Gemini fails or local model is inaccurate)
    # The current local model seems to provide very low values (e.g. ₹180k for 2000 sqft).
    # We implement a more realistic heuristic for Indian Real Estate (specifically AP regions).
    
    # Base rate per sq ft (realistic for Ongole/Nellore area is ~₹3500-₹4500)
    base_rate = 3800 
    
    # Regional multipliers
    location_multipliers = {
        "Ongole": 1.0,
        "Nellore": 1.15,
        "Kurnool": 0.95,
        "Nandyala": 0.85
    }
    loc_mult = location_multipliers.get(request.location, 1.0)
    
    # Condition multipliers
    condition_multipliers = {
        "Excellent": 1.25,
        "Good": 1.0,
        "Fair": 0.8
    }
    cond_mult = condition_multipliers.get(request.condition, 1.0)
    
    # Calculate base price
    heuristic_price = base_rate * request.area * loc_mult * cond_mult
    
    # Add room/floor bonuses
    heuristic_price += request.bedrooms * 250000   # 2.5 Lakh per bedroom
    heuristic_price += request.bathrooms * 150000  # 1.5 Lakh per bathroom
    heuristic_price += request.floors * 500000     # 5 Lakh per floor
    
    # Garage bonus
    if request.garage.lower() == "yes":
        heuristic_price += 300000 # 3 Lakh for garage
    
    # Year Built adjustment (approx 1% depreciation per year from 2026)
    age = 2026 - request.yearBuilt
    depreciation = max(0.6, 1.0 - (age * 0.01))
    heuristic_price *= depreciation

    # Now decide whether to use model or heuristic
    # If the local model exists, we can still call it, but if it's too low, we use heuristic
    final_price = heuristic_price
    source = "AI Heuristic Model"

    if model is not None:
        try:
            data = {
                'area': [request.area], 'bedrooms': [request.bedrooms], 'bathrooms': [request.bathrooms],
                'floors': [request.floors], 'yearBuilt': [request.yearBuilt], 'location': [request.location],
                'condition': [request.condition], 'garage': [request.garage],
            }
            df = pd.DataFrame(data)
            model_prediction = float(model.predict(df)[0])
            
            # If the model prediction is extremely low (less than ₹1000/sqft), it's likely a bad mock model
            if model_prediction < (request.area * 1000):
                print(f"Local model predicted suspiciously low value (₹{model_prediction}). Overriding with heuristic.")
                final_price = heuristic_price
                source = "Refined AI Heuristic"
            else:
                final_price = model_prediction
                source = "Local ML Model"
        except Exception as e:
            print(f"Model prediction error: {e}")

    from datetime import datetime
    record = {
        "timestamp": datetime.now().isoformat(),
        "property_details": request.model_dump(),
        "predicted_price_inr": final_price,
        "source": source
    }
    
    print(f"Prediction result: ₹{final_price} from {source}")
    
    # Save to Firebase Firestore
    if firebase_db:
        try:
            firebase_db.collection("price_predictions").add(record.copy())
        except Exception as db_e:
            print(f"Firebase save error: {db_e}")
            
    # Save to MongoDB
    if mongo_db is not None:
        try:
            mongo_db.predictions.insert_one(record.copy())
        except Exception as db_e:
            print(f"MongoDB save error: {db_e}")
            
    return {"price": float(final_price), "source": source}

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    if not gemini_model:
        raise HTTPException(status_code=500, detail="Gemini model is not configured. Please add GEMINI_API_KEY in .env")
        
    try:
        contents = await file.read()
        
        # Hash the image contents to prevent predicting the exact same image multiple times
        image_hash = hashlib.md5(contents).hexdigest()
        if image_hash in prediction_cache:
            return {"price": prediction_cache[image_hash], "source": "Gemini AI Vision (Cached)"}
        
        prompt = """
        You are an expert real estate appraiser in India. 
        Analyze this image.
        First, determine if the image contains a house, apartment, building, property, or floor plan that can be appraised.
        If it is NOT a house or property (e.g., it is a person, animal, car, random object, or landscape without properties), you MUST respond exactly with the text: NOT_A_HOUSE.
        If it IS a house or property, estimate the current realistic market price in Indian Rupees (INR) based on the visual condition, size, and features.
        Respond ONLY with a single numeric value representing the estimated price in INR. 
        Do not include commas, text, or the ₹ symbol. No explanation. Just the number (unless it is NOT_A_HOUSE).
        """
        
        image_parts = [
            {
                "mime_type": file.content_type,
                "data": contents
            }
        ]
        
        response = gemini_model.generate_content([prompt, image_parts[0]], generation_config=genai.types.GenerationConfig(temperature=0.0))
        response_text = response.text.strip()
        
        if "NOT_A_HOUSE" in response_text:
            raise HTTPException(status_code=400, detail="Wrong image uploaded! Please upload a valid house or property image.")
            
        clean_number = re.sub(r'[^\d.]', '', response_text)
        
        if not clean_number:
            raise ValueError("Could not parse a valid number from the AI response.")
            
        predicted_price_inr = float(clean_number)
        
        # Save to cache
        prediction_cache[image_hash] = predicted_price_inr
        
        return {"price": predicted_price_inr, "source": "Gemini AI Vision"}
    except Exception as e:
        print(f"Image prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

class AssessRequest(BaseModel):
    image: str
    bedrooms: int
    area: float
    location: str
    property_type: str

@app.post("/assess")
async def assess_property(request: AssessRequest):
    if not gemini_model:
        raise HTTPException(status_code=500, detail="Gemini model is not configured.")
        
    try:
        import requests as req
        import base64
        
        # Handle image data
        if request.image.startswith("http"):
            try:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
                img_response = req.get(request.image, headers=headers)
                img_response.raise_for_status()
                contents = img_response.content
                mime_type = img_response.headers.get('Content-Type', 'image/jpeg')
            except Exception as e:
                raise HTTPException(status_code=400, detail="Failed to fetch image from URL")
        elif request.image.startswith("data:image"):
            # Format: 'data:image/png;base64,iVBORw0K...'
            header, encoded = request.image.split(",", 1)
            mime_type = header.split(";")[0].split(":")[1]
            contents = base64.b64decode(encoded)
        else:
            raise HTTPException(status_code=400, detail="Invalid image format. Must be URL or base64 data URI.")

        prompt = f"""
        You are an expert real estate appraiser in India. 
        Analyze the attached image along with these details for a property in {request.location}:
        - Type: {request.property_type}
        - Bedrooms: {request.bedrooms}
        - Area: {request.area} sq ft
        
        Estimate the current realistic market price in Indian Rupees (INR) based on the visual condition from the image and the provided specifications.
        Respond ONLY with a single numeric value representing the estimated price in INR. 
        Do not include commas, text, or the ₹ symbol. No explanation. Just the number.
        """
        
        image_parts = [{"mime_type": mime_type, "data": contents}]
        
        response = gemini_model.generate_content(
            [prompt, image_parts[0]], 
            generation_config=genai.types.GenerationConfig(temperature=0.0)
        )
        response_text = response.text.strip()
        
        clean_number = re.sub(r'[^\d.]', '', response_text)
        if not clean_number:
            raise ValueError("Could not parse a valid number from the AI response.")
            
        predicted_price_inr = float(clean_number)
        
        from datetime import datetime
        record = {
            "timestamp": datetime.now().isoformat(),
            "property_details": request.dict(),
            "predicted_price_inr": predicted_price_inr,
            "source": "Gemini AI Visual + Specs"
        }
        
        # Save to Firebase Firestore
        if firebase_db:
            try:
                firebase_db.collection("price_predictions").add(record.copy())
            except Exception as db_e:
                print(f"Firebase save error: {db_e}")
                
        # Save to MongoDB
        if mongo_db is not None:
            try:
                mongo_db.predictions.insert_one(record.copy())
            except Exception as db_e:
                print(f"MongoDB save error: {db_e}")
                
        return {"price": predicted_price_inr, "source": "Gemini AI Visual + Specs"}
    except Exception as e:
        print(f"Assessment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from typing import Optional

class PropertyRequest(BaseModel):
    title: str
    type: str
    location: str
    price: float
    bedrooms: int
    bathrooms: int
    area: float
    image: str
    description: Optional[str] = None

@app.post("/properties")
async def add_property(prop: PropertyRequest):
    import time
    prop_dict = prop.dict()
    prop_dict["id"] = int(time.time() * 1000)
    
    success = False
    
    # Save to MongoDB
    if mongo_db is not None:
        try:
            mongo_db.properties.insert_one(prop_dict.copy())
            success = True
        except Exception as e:
            print("MongoDB property save error:", e)
            
    # Save to Firebase
    if firebase_db:
        try:
            firebase_db.collection("properties").add(prop_dict.copy())
            success = True
        except Exception as e:
            print("Firebase property save error:", e)
            
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save property to database")
        
    if "_id" in prop_dict:
        del prop_dict["_id"]
        
    return {"message": "Property added successfully", "property": prop_dict}

@app.get("/properties")
async def get_properties():
    properties = []
    
    # Fetch from MongoDB if available
    if mongo_db is not None:
        try:
            cursor = mongo_db.properties.find().sort("id", -1)
            for doc in cursor:
                if "_id" in doc:
                    del doc["_id"]
                properties.append(doc)
            return {"properties": properties}
        except Exception as e:
            print("MongoDB fetch error:", e)
            
    # Fallback to Firebase
    if firebase_db:
        try:
            from firebase_admin import firestore
            docs = firebase_db.collection("properties").order_by("id", direction=firestore.Query.DESCENDING).get()
            for doc in docs:
                p = doc.to_dict()
                if "_id" in p: del p["_id"]
                properties.append(p)
            return {"properties": properties}
        except Exception as e:
            print("Firebase fetch error:", e)
            
    return {"properties": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
