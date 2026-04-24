import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from typing import List
import os

FEATURES = ["clorof_a", "p_tot", "n_no3", "od_porcentaje", "pct_pipas"]
TARGET = "ica_score"

# Stress multipliers that simulate one year of environmental degradation/recovery.
# Based on known eutrophication dynamics and water quality literature for Mexico.
FUTURE_DELTAS = {
    "clorof_a": 0.18,    # Algal bloom growth: +18% where already elevated
    "p_tot":    0.15,    # Phosphorus accumulation from agriculture: +15%
    "n_no3":    0.12,    # Agricultural nitrate runoff: +12%
    "od_porcentaje": -0.05,  # Oxygen depletion from organic load: -5%
    "pct_pipas": 0.02,   # Slight increase in truck water dependency: +2%
}


def _load_dataset(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip()
    df["mun_code"] = df["cve_geo"] % 1000
    return df


def _train_model(df: pd.DataFrame):
    X = df[FEATURES].values
    y = df[TARGET].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    rf = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    rf.fit(X_scaled, y)
    return rf, scaler


def _ica_to_status(score: float) -> str:
    if score >= 70:
        return "Safe"
    elif score >= 50:
        return "Moderate"
    else:
        return "Critical"


def _df_to_records(df: pd.DataFrame, ica_col: str) -> List[dict]:
    records = []
    for _, row in df.iterrows():
        score = float(np.clip(row[ica_col], 0, 100))
        records.append({
            "id": str(int(row["cve_geo"])),
            "mun_code": int(row["mun_code"]),
            "name": str(row["municipio"]),
            "ica_score": round(score, 1),
            "status": _ica_to_status(score),
            "clorof_a": round(float(row["clorof_a"]), 4),
            "p_tot": round(float(row["p_tot"]), 4),
            "n_no3": round(float(row["n_no3"]), 4),
            "od_porcentaje": round(float(row["od_porcentaje"]), 2),
            "pct_pipas": round(float(row["pct_pipas"]), 4),
        })
    return records


class WaterQualityModel:
    def __init__(self, csv_path: str):
        self.df = _load_dataset(csv_path)
        self.rf, self.scaler = _train_model(self.df)

    def get_current(self) -> List[dict]:
        return _df_to_records(self.df, TARGET)

    def get_predictions(self) -> List[dict]:
        future_df = self.df.copy()

        # Apply per-municipality stress deltas proportional to current severity
        for col, delta in FUTURE_DELTAS.items():
            if col == "od_porcentaje":
                # Municipalities with low oxygen degrade faster; healthy ones degrade slowly
                severity_factor = 1 + (1 - future_df[col] / 100).clip(0, 1)
                future_df[col] = (future_df[col] * (1 + delta * severity_factor)).clip(0, 100)
            else:
                # Degradation is proportional to current pollution level (worse = worsens faster)
                future_df[col] = future_df[col] * (1 + delta)

        X_future = self.scaler.transform(future_df[FEATURES].values)
        future_df["ica_predicted"] = self.rf.predict(X_future)
        return _df_to_records(future_df, "ica_predicted")
