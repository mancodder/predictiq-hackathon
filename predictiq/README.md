# PredictIQ - Round 2 Hackathon Release

**AI-Powered Customer Churn Early-Warning & Retention Intelligence**

PredictIQ is a proactive customer-retention intelligence platform that transforms traditional retrospective dashboards into an early-warning system. It focuses on answering:
*"Which customers are likely to churn, why are they at risk, how much revenue is exposed, and what should we do to save them?"*

## Architecture & Workflow

**Data Pipeline → Model (XGBoost) → Explainability (SHAP) → Prioritization → Action Engine**

1. **Data Quality & Leakage Protection**: Explicit checks ensure no post-churn or future billing data enters the model.
2. **Model Training**: Evaluates Logistic Regression, Random Forest, and XGBoost, selecting XGBoost optimized via F1-threshold tuning and scale_pos_weight.
3. **SHAP Explanations**: Converts complex statistical attributions into human-readable retentive and risk drivers.
4. **Retention Priority Score**: Ranks customers using a custom formula combining Churn Probability (60%) and Normalized MRR Exposure (40%).
5. **Customer Health Score**: Scores customers from 0-100 (Healthy, Watch, Critical).
6. **Recommended Action Engine**: A transparent rule-based engine suggesting targeted interventions (e.g., CSM Intervention, Contract Upgrades) based on SHAP risk profiles.

## Project Structure
- `/data`: Datasets (WA_Fn-UseC_-Telco-Customer-Churn.csv)
- `/ml/pipeline_v2.py`: The upgraded ML pipeline with explicit data quality checks and prioritization logic.
- `/models`: Trained model artifacts (XGBoost, SHAP Explainer, Scalers, JSON Data Health reports)
- `/backend/main.py`: FastAPI backend exposing V2 intelligence endpoints.
- `/frontend`: React, Vite, and Tailwind CSS dashboard featuring Executive Overview and Customer 360 views.

## Setup and Running Local Server

### 1. Model Training (V2 Pipeline)
If you want to re-train the machine learning models and recreate artifacts:
```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python ml\pipeline_v2.py
```

### 2. Backend
To run the FastAPI server (serves on port 8000):
```bash
.\venv\Scripts\activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend
To start the Vite dashboard (serves on port 5173):
```bash
cd frontend
npm install
npm run dev
```

## Dataset & Limitations
- **Dataset Strategy**: We initially attempted to migrate to a provided "temporal" dataset (`telecom customer churn`), but extensive EDA revealed it was entirely synthetic noise with zero correlation/predictive signal (ROC-AUC ~0.50). To maintain **absolute truthfulness and credibility**, we reverted to the original real-world Kaggle Telco snapshot dataset.
- **Snapshot Constraint**: Because the dataset is a single snapshot, we cannot engineer genuine longitudinal trends (e.g., month-over-month usage drops). All SHAP drivers reflect snapshot metrics (Tenure, Charges, Contract).
- **Drift Simulation**: Drift metrics in the Data Health tab are simulated for demonstration, as no real-time data stream is available. Data Quality metrics (Missing Values, Duplicates, Imbalance) are 100% genuine and live from the pipeline.
