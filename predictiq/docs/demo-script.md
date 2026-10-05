# PredictIQ - Demo Script (3 minutes)

**1. Executive Overview (0:00 - 0:45)**
*Open on the Executive Overview page.*
**Speaker:** "Traditional dashboards tell a business what happened last month. PredictIQ focuses on what may happen next month. This is our Executive Overview, a Command Center for proactive customer retention. Right now, you can see our total customers, but more importantly, we've identified the high-risk segment and the estimated revenue currently at risk."
*Hover over the Risk Distribution pie chart.*
**Speaker:** "We don't just stop at aggregates. On the right, we have a prioritized list of our highest-value, at-risk customers, allowing the success team to know exactly who to target first."

**2. Customer Exploration & Explanation (0:45 - 1:45)**
*Click to 'Customer Explorer' and then select a high-risk customer.*
**Speaker:** "Let's dive into an individual customer. We see a 90%+ churn probability. But a probability isn't enough to take action—we need to know *why*."
*Scroll down to the SHAP explanation section.*
**Speaker:** "Using SHAP explainability, the model tells us exactly what's pushing this customer toward churn—like their month-to-month contract or short tenure—and what's keeping them here. We combine this risk with their monthly revenue to generate a clear 'Retention Priority' score to guide human decision-making."

**3. Honesty & Evaluation (1:45 - 2:30)**
*Click to 'Model Performance' tab.*
**Speaker:** "We believe in honest AI. PredictIQ clearly shows measured performance metrics based on a rigorous holdout evaluation. You can see we're using XGBoost and we display the actual ROC-AUC and F1 scores rather than cherry-picked accuracy, because we know churn data is imbalanced."

**4. Monitoring & Scalability (2:30 - 3:00)**
*Click to 'Model Monitoring'.*
**Speaker:** "Finally, models degrade over time. PredictIQ is built with enterprise architecture in mind, continuously monitoring for data leakage and feature drift, ensuring that when the environment changes, the model alerts the team. Predict, Explain, Prioritize, and Monitor. That is PredictIQ."
