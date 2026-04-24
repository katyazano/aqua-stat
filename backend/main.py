import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from model import WaterQualityModel

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "dataset_app_agua_jalisco.csv"

app = FastAPI(title="AquaStat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Model loads once at startup — training is fast (~0.5s on this dataset size)
try:
    model = WaterQualityModel(str(CSV_PATH))
except Exception as e:
    raise RuntimeError(f"Failed to load dataset at {CSV_PATH}: {e}")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/municipalities")
def get_municipalities():
    """Returns current water quality data for all 125 Jalisco municipalities."""
    try:
        return model.get_current()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/predict")
def get_predictions():
    """Returns Random Forest predictions for one year in the future."""
    try:
        return model.get_predictions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
