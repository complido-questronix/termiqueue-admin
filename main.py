from fastapi import FastAPI
import firebase_admin
from firebase_admin import credentials, firestore

# This connects the Python code to your Firebase
# Replace 'your-key-filename.json' with the actual name of the file you downloaded
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Success: Connected to Firebase!")
except Exception as e:
    print(f"Error: Could not find the key file. {e}")

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Your API is officially talking to Firebase!"}