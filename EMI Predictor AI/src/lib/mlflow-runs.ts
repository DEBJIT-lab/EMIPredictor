/**
 * MLflow experiment snapshot exported from the EMIpredictor training notebook.
 * Experiment: EMI_Prediction_Project — 6 runs, 2 registered models.
 */

export interface ClassificationRun {
  runId: string;
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  params: string;
}

export interface RegressionRun {
  runId: string;
  model: string;
  rmse: number;
  mae: number;
  r2: number;
  mape: number;
  params: string;
}

export const CLASSIFICATION_RUNS: ClassificationRun[] = [
  {
    runId: "a41c2f7d",
    model: "Logistic Regression",
    accuracy: 0.8859,
    precision: 0.7447,
    recall: 0.5772,
    f1: 0.6503,
    rocAuc: 0.924,
    params: "solver=liblinear, C=0.1, max_iter=1000",
  },
  {
    runId: "c93b18ae",
    model: "Random Forest Classifier",
    accuracy: 0.9079,
    precision: 0.9023,
    recall: 0.5599,
    f1: 0.691,
    rocAuc: 0.9619,
    params: "n_estimators=100, max_depth=10, random_state=42",
  },
  {
    runId: "5ed5fce0",
    model: "XGBoost Classifier",
    accuracy: 0.9761,
    precision: 0.9518,
    recall: 0.9166,
    f1: 0.9339,
    rocAuc: 0.9967,
    params: "n_estimators=200, learning_rate=0.1, max_depth=6",
  },
];

export const REGRESSION_RUNS: RegressionRun[] = [
  {
    runId: "1f80ad42",
    model: "Linear Regression",
    rmse: 4142.05,
    mae: 2975.44,
    r2: 0.7162,
    mape: 0.412,
    params: "fit_intercept=True",
  },
  {
    runId: "7bd0c115",
    model: "Random Forest Regressor",
    rmse: 2374.45,
    mae: 1484.29,
    r2: 0.9068,
    mape: 0.196,
    params: "n_estimators=100, max_depth=12, random_state=42",
  },
  {
    runId: "89c8ef6f",
    model: "XGBoost Regressor",
    rmse: 1306.33,
    mae: 868.82,
    r2: 0.9718,
    mape: 0.118,
    params: "n_estimators=300, learning_rate=0.1, max_depth=8",
  },
];

export const REGISTERED_MODELS = [
  {
    name: "EMI_Eligibility_XGBoost_Classifier",
    version: 1,
    stage: "Production",
    runId: "5ed5fce0",
    metric: "ROC-AUC 0.9967",
  },
  {
    name: "EMI_Amount_XGBoost_Regression",
    version: 1,
    stage: "Production",
    runId: "89c8ef6f",
    metric: "R² 0.9718",
  },
];

/** Aggregate profile of the 400k-record training corpus (from notebook EDA). */
export const DATASET_PROFILE = {
  records: 400000,
  cleanedRecords: 264523,
  features: 22,
  encodedFeatures: 41,
  eligibleShare: 0.286,
  meanSalary: 59557,
  meanAge: 38.9,
  meanTenure: 5.37,
};

export const SCENARIO_DISTRIBUTION = [
  { scenario: "Personal Loan", records: 96400, approvalRate: 0.24 },
  { scenario: "Home Loan", records: 88200, approvalRate: 0.31 },
  { scenario: "Car Loan", records: 79100, approvalRate: 0.29 },
  { scenario: "Education Loan", records: 71500, approvalRate: 0.34 },
  { scenario: "Consumer Durable", records: 64800, approvalRate: 0.25 },
];

export const FEATURE_IMPORTANCE = [
  { feature: "credit_score", importance: 0.271 },
  { feature: "affordability_ratio", importance: 0.198 },
  { feature: "monthly_salary", importance: 0.152 },
  { feature: "debt_to_income", importance: 0.117 },
  { feature: "current_emi", importance: 0.083 },
  { feature: "years_of_employment", importance: 0.061 },
  { feature: "bank_balance", importance: 0.049 },
  { feature: "expense_to_income", importance: 0.039 },
  { feature: "dependents", importance: 0.018 },
  { feature: "emi_scenario", importance: 0.012 },
];

export const SALARY_BANDS = [
  { band: "<25k", applicants: 42800, approvalRate: 0.07 },
  { band: "25-50k", applicants: 96500, approvalRate: 0.18 },
  { band: "50-75k", applicants: 71200, approvalRate: 0.32 },
  { band: "75-100k", applicants: 33900, approvalRate: 0.47 },
  { band: "100k+", applicants: 20123, approvalRate: 0.63 },
];

export const CREDIT_BANDS = [
  { band: "300-579", approvalRate: 0.03, defaultRate: 0.31 },
  { band: "580-669", approvalRate: 0.12, defaultRate: 0.18 },
  { band: "670-739", approvalRate: 0.36, defaultRate: 0.09 },
  { band: "740-799", approvalRate: 0.61, defaultRate: 0.04 },
  { band: "800-850", approvalRate: 0.78, defaultRate: 0.01 },
];
