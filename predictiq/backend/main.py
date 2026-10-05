from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import pickle
import os
import json

app = FastAPI(title="PredictIQ API V2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models')

def load_artifacts():
    try:
        df = pd.read_csv(os.path.join(MODEL_DIR, 'dashboard_data_v2.csv'))
        with open(os.path.join(MODEL_DIR, 'metrics_v2.pkl'), 'rb') as f:
            metrics = pickle.load(f)
        with open(os.path.join(MODEL_DIR, 'explainer_v2.pkl'), 'rb') as f:
            explainer = pickle.load(f)
        with open(os.path.join(MODEL_DIR, 'features_v2.pkl'), 'rb') as f:
            features = pickle.load(f)
        with open(os.path.join(MODEL_DIR, 'encoders_v2.pkl'), 'rb') as f:
            encoders = pickle.load(f)
        with open(os.path.join(MODEL_DIR, 'scaler_v2.pkl'), 'rb') as f:
            scaler = pickle.load(f)
        with open(os.path.join(MODEL_DIR, 'data_health.json'), 'r') as f:
            data_health = json.load(f)
            
        return df, metrics, explainer, features, encoders, scaler, data_health
    except Exception as e:
        print(f"Error loading artifacts: {e}")
        return None, None, None, None, None, None, None

df, metrics, explainer, features, encoders, scaler, data_health = load_artifacts()

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    if df is None:
        return {"error": "Model not trained yet"}
    
    total_customers = len(df)
    high_risk = len(df[df['Risk_Level'] == 'HIGH'])
    medium_risk = len(df[df['Risk_Level'] == 'MEDIUM'])
    low_risk = len(df[df['Risk_Level'] == 'LOW'])
    
    # Calculate At-Risk MRR
    total_revenue_at_risk = float(df[df['Risk_Level'] == 'HIGH']['Revenue_Exposure'].sum())
    
    # Priority stats
    high_priority = len(df[df['Priority_Level'] == 'CRITICAL'])
    
    return {
        "total_customers": total_customers,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "revenue_at_risk": total_revenue_at_risk,
        "high_priority": high_priority
    }

@app.get("/api/customers")
def get_customers():
    if df is None:
        return []
    
    # Sort by Priority Score for the new workflow
    top_customers = df.sort_values(by='Priority_Score', ascending=False).head(100)
    
    # Replace NaN with None
    top_customers = top_customers.replace({np.nan: None})
    
    cols = ['customerID', 'Churn_Prob', 'Risk_Level', 'Health_Score', 'Health_Status', 
            'MonthlyCharges', 'tenure', 'Contract', 'Priority_Score', 'Priority_Level', 
            'Revenue_Exposure', 'Recommended_Action']
            
    return top_customers[cols].to_dict(orient='records')

@app.get("/api/customer/{customer_id}")
def get_customer_details(customer_id: str):
    if df is None:
        return {"error": "Model not trained"}
        
    cust_data = df[df['customerID'] == customer_id]
    if len(cust_data) == 0:
        return {"error": "Customer not found"}
        
    cust_data = cust_data.iloc[0]
    
    # Preprocess
    raw_cust = cust_data.copy()
    encoded_vals = []
    
    for col in features:
        val = raw_cust[col]
        if col in encoders:
            try:
                val = encoders[col].transform([str(val)])[0]
            except:
                val = 0
        encoded_vals.append(val)
        
    proc_df = pd.DataFrame([encoded_vals], columns=features)
    numerical = [c for c in features if c not in encoders.keys()]
    if numerical:
        proc_df[numerical] = scaler.transform(proc_df[numerical])
        
    # Calculate SHAP
    shap_values = explainer.shap_values(proc_df)
    
    shap_df = pd.DataFrame({
        'feature': features,
        'value': raw_cust[features].values,
        'impact': shap_values[0]
    })
    
    shap_df['abs_impact'] = shap_df['impact'].abs()
    shap_df = shap_df.sort_values(by='abs_impact', ascending=False).head(10)
    
    risk_factors = []
    protective_factors = []
    
    # Generate Human-Readable reasons based on SHAP impact
    for _, row in shap_df.iterrows():
        impact_val = float(row['impact'])
        feat = row['feature']
        val = str(row['value'])
        
        # Simple human readable logic
        direction = "increasing" if impact_val > 0 else "reducing"
        reason = f"{feat} ({val}) is associated with {direction} predicted churn risk."
        
        if feat == 'Contract':
            if val == 'Month-to-month' and impact_val > 0:
                reason = "Month-to-month contract is associated with increased predicted churn risk."
            elif val in ['One year', 'Two year'] and impact_val < 0:
                reason = f"{val} contract is associated with reduced predicted churn risk."
                
        factor = {
            'feature': feat,
            'value': val,
            'impact': impact_val,
            'reason': reason
        }
        
        if impact_val > 0:
            risk_factors.append(factor)
        else:
            protective_factors.append(factor)
            
    risk_factors = sorted(risk_factors, key=lambda x: x['impact'], reverse=True)
    protective_factors = sorted(protective_factors, key=lambda x: x['impact'])
    
    cust_dict = cust_data.replace({np.nan: None}).to_dict()
    
    return {
        "details": cust_dict,
        "explanations": {
            "risk_factors": risk_factors,
            "protective_factors": protective_factors
        }
    }

@app.get("/api/metrics")
def get_metrics():
    if metrics is None:
        return {"error": "Model not trained"}
    return metrics

@app.get("/api/data-health")
def get_monitoring():
    if data_health is None:
        return {"error": "Data health report not generated"}
        
    return {
        "data_quality": data_health,
        "drift": {
            "overall_status": "NORMAL",
            "features": [
                {"name": "MonthlyCharges", "status": "LOW", "psi": 0.02},
                {"name": "tenure", "status": "LOW", "psi": 0.04},
                {"name": "Contract", "status": "MEDIUM", "psi": 0.12}
            ]
        },
        "note": "Drift metrics are simulated for MVP. Data Quality metrics are live from the pipeline."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
