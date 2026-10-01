from fastapi  import FastAPI
from pathlib import Path
import pandas as pd
import joblib
from schema.schema import HouseFeatures
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    alloworigins=[
            "http://localhost:5500",
            "http://127.0.0.1.5500",
    ],
    allow_methods=["*"],
    allow_header=["*"],
)

def load_model(): 
    model_path = (
        Path(__file__).resolve().parent.parent
        / "model"
        / "house-price-prediction.joblib"
    )

    pipeline = joblib.load(model_path)
    return pipeline
    
pipeline = load_model()




@app.get("/")
def home():
    return{"message":"this is api of house predictor"}

@app.get("/health")
def health():
    return{"status": "healthy"}

@app.post("/predict")

def prediction(house: HouseFeatures):
    
    input_data = pd.DataFrame([{
        "living area":house.living_area,
        "grade of the house":house.grade,
        "number of bathrooms":house.num_of_bathrooms,
        "number of bedrooms":house.num_of_bedrooms,
        "number of floors":house.num_of_floors,
    }])
    
    prediction = pipeline.predict(input_data)[0]
    
    return{
        "predicted_price":round(float(prediction),2)
        }
    