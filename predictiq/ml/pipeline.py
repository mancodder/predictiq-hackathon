import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score, confusion_matrix
import shap
import pickle
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/telco_churn.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models')

def load_data():
    df = pd.read_csv(DATA_PATH)
    # Handle missing values in TotalCharges
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    df['TotalCharges'] = df['TotalCharges'].fillna(df['TotalCharges'].median())
    return df

def preprocess_data(df):
    df = df.copy()
    # Drop customerID for training but keep it for reference later if needed
    # Actually, we should keep customerID out of features
    target = 'Churn'
    
    # Binary encode target
    df[target] = df[target].map({'Yes': 1, 'No': 0})
    
    features = [c for c in df.columns if c not in [target, 'customerID']]
    
    categorical = df[features].select_dtypes(include=['object', 'string', 'category']).columns.tolist()
    numerical = [c for c in features if c not in categorical]
    
    # Label encoding for categoricals
    encoders = {}
    for col in categorical:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    # Scale numericals
    scaler = StandardScaler()
    df[numerical] = scaler.fit_transform(df[numerical])
    
    return df, features, encoders, scaler

def calculate_metrics(y_true, y_pred, y_prob):
    return {
        'roc_auc': float(roc_auc_score(y_true, y_prob)),
        'precision': float(precision_score(y_true, y_pred)),
        'recall': float(recall_score(y_true, y_pred)),
        'f1': float(f1_score(y_true, y_pred)),
        'confusion_matrix': confusion_matrix(y_true, y_pred).tolist()
    }

def train_pipeline():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print("Loading data...")
    raw_df = load_data()
    
    print("Preprocessing data...")
    df, features, encoders, scaler = preprocess_data(raw_df)
    
    X = df[features]
    y = df['Churn']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Logistic Regression...")
    lr = LogisticRegression(max_iter=1000)
    lr.fit(X_train, y_train)
    
    print("Training XGBoost...")
    xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    xgb.fit(X_train, y_train)
    
    # Evaluate
    lr_preds = lr.predict(X_test)
    lr_probs = lr.predict_proba(X_test)[:, 1]
    xgb_preds = xgb.predict(X_test)
    xgb_probs = xgb.predict_proba(X_test)[:, 1]
    
    metrics = {
        'Logistic Regression': calculate_metrics(y_test, lr_preds, lr_probs),
        'XGBoost': calculate_metrics(y_test, xgb_preds, xgb_probs)
    }
    
    print("Metrics:")
    print(metrics)
    
    # Save best model (XGBoost) and artifacts
    with open(os.path.join(MODEL_DIR, 'xgb_model.pkl'), 'wb') as f:
        pickle.dump(xgb, f)
    with open(os.path.join(MODEL_DIR, 'encoders.pkl'), 'wb') as f:
        pickle.dump(encoders, f)
    with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
    with open(os.path.join(MODEL_DIR, 'features.pkl'), 'wb') as f:
        pickle.dump(features, f)
    with open(os.path.join(MODEL_DIR, 'metrics.pkl'), 'wb') as f:
        pickle.dump(metrics, f)
        
    # Generate SHAP explainer
    explainer = shap.TreeExplainer(xgb)
    with open(os.path.join(MODEL_DIR, 'explainer.pkl'), 'wb') as f:
        pickle.dump(explainer, f)
        
    # Save a sample of data with predictions for dashboard
    test_df = raw_df.loc[X_test.index].copy()
    test_df['Churn_Prob'] = xgb_probs
    test_df['Risk_Level'] = pd.cut(test_df['Churn_Prob'], bins=[-np.inf, 0.4, 0.7, np.inf], labels=['LOW', 'MEDIUM', 'HIGH'])
    
    # Revenue at Risk (Estimate)
    test_df['MonthlyCharges'] = pd.to_numeric(test_df['MonthlyCharges'], errors='coerce').fillna(0)
    test_df['Revenue_At_Risk'] = test_df['Churn_Prob'] * test_df['MonthlyCharges']
    
    # Priority Score (0-100)
    max_rev = test_df['Revenue_At_Risk'].max()
    if max_rev > 0:
        test_df['Priority_Score'] = (test_df['Revenue_At_Risk'] / max_rev) * 100
    else:
        test_df['Priority_Score'] = 0
        
    test_df['Priority'] = pd.cut(test_df['Priority_Score'], bins=[-np.inf, 33, 66, np.inf], labels=['LOW', 'MEDIUM', 'CRITICAL'])
    
    test_df.to_csv(os.path.join(MODEL_DIR, 'dashboard_data.csv'), index=False)
    
    print("Pipeline complete!")

if __name__ == '__main__':
    train_pipeline()
