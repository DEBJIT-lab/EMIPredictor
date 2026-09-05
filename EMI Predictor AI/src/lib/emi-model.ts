/**
 * Surrogate inference layer for the EMI risk platform.
 *
 * The production models (XGBoost classifier for eligibility, XGBoost regressor
 * for maximum monthly EMI) were trained in the EMIpredictor notebook on 400k
 * financial records and registered in MLflow as:
 *   - EMI_Eligibility_XGBoost_Classifier  (v1)
 *   - EMI_Amount_XGBoost_Regression       (v1)
 *
 * This module reproduces the notebook's feature engineering and a calibrated
 * scoring surrogate so the web app can serve real-time assessments.
 */

export type EmiScenario =
  | "Personal Loan"
  | "Home Loan"
  | "Car Loan"
  | "Education Loan"
  | "Consumer Durable";

export const EMI_SCENARIOS: EmiScenario[] = [
  "Personal Loan",
  "Home Loan",
  "Car Loan",
  "Education Loan",
  "Consumer Durable",
];

export const GENDERS = ["Male", "Female", "Other"] as const;
export const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"] as const;
export const EDUCATION = ["High School", "Graduate", "Post Graduate", "Professional"] as const;
export const EMPLOYMENT_TYPES = ["Private", "Government", "Self Employed", "Contract"] as const;

export interface ApplicantInput {
  age: number;
  gender: string;
  maritalStatus: string;
  education: string;
  employmentType: string;
  yearsOfEmployment: number;
  monthlySalary: number;
  monthlyRent: number;
  dependents: number;
  monthlyExpenses: number;
  existingLoans: boolean;
  currentEmi: number;
  creditScore: number;
  bankBalance: number;
  emiScenario: EmiScenario | string;
}

export interface EngineeredFeatures {
  disposableIncome: number;
  debtToIncome: number;
  expenseToIncome: number;
  affordabilityRatio: number;
  savingsRunwayMonths: number;
  perDependentIncome: number;
  employmentStability: number;
  creditStrength: number;
}

export interface AssessmentResult {
  features: EngineeredFeatures;
  riskScore: number; // 0 (safe) - 100 (high risk)
  riskBand: "Low" | "Moderate" | "Elevated" | "High";
  eligibilityProbability: number; // 0-1
  eligible: boolean;
  maxMonthlyEmi: number;
  foirCap: number;
  drivers: { label: string; impact: number; detail: string }[];
}

const EMPLOYMENT_WEIGHT: Record<string, number> = {
  Government: 1,
  Private: 0.82,
  Contract: 0.55,
  "Self Employed": 0.6,
};

const EDUCATION_WEIGHT: Record<string, number> = {
  "High School": 0.6,
  Graduate: 0.8,
  "Post Graduate": 0.9,
  Professional: 1,
};

/** Scenario-specific FOIR (fixed obligation to income ratio) ceilings. */
const SCENARIO_FOIR: Record<string, number> = {
  "Home Loan": 0.55,
  "Car Loan": 0.45,
  "Education Loan": 0.5,
  "Personal Loan": 0.4,
  "Consumer Durable": 0.35,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function engineerFeatures(a: ApplicantInput): EngineeredFeatures {
  const salary = Math.max(a.monthlySalary, 1);
  const fixed = a.monthlyRent + a.monthlyExpenses + a.currentEmi;
  const disposableIncome = salary - fixed;

  return {
    disposableIncome,
    debtToIncome: a.currentEmi / salary,
    expenseToIncome: (a.monthlyRent + a.monthlyExpenses) / salary,
    affordabilityRatio: disposableIncome / salary,
    savingsRunwayMonths: a.bankBalance / Math.max(fixed, 1),
    perDependentIncome: disposableIncome / (1 + Math.max(a.dependents, 0)),
    employmentStability: clamp(
      (EMPLOYMENT_WEIGHT[a.employmentType] ?? 0.7) * clamp(a.yearsOfEmployment / 8, 0.15, 1),
      0,
      1,
    ),
    creditStrength: clamp((a.creditScore - 300) / 550, 0, 1),
  };
}

export function assessApplicant(a: ApplicantInput): AssessmentResult {
  const f = engineerFeatures(a);

  // Weighted risk contributions (mirrors XGBoost gain ranking from the notebook).
  const creditRisk = (1 - f.creditStrength) * 34;
  const affordabilityRisk = clamp(1 - f.affordabilityRatio / 0.45, 0, 1) * 26;
  const debtRisk = clamp(f.debtToIncome / 0.4, 0, 1) * 16;
  const stabilityRisk = (1 - f.employmentStability) * 12;
  const liquidityRisk = clamp(1 - f.savingsRunwayMonths / 6, 0, 1) * 8;
  const dependentRisk = clamp(a.dependents / 5, 0, 1) * 4;
  const educationBonus = (EDUCATION_WEIGHT[a.education] ?? 0.8) * 2;

  const riskScore = clamp(
    creditRisk +
      affordabilityRisk +
      debtRisk +
      stabilityRisk +
      liquidityRisk +
      dependentRisk -
      educationBonus,
    0,
    100,
  );

  const logit = 4.6 - riskScore * 0.115;
  const eligibilityProbability = clamp(1 / (1 + Math.exp(-logit)), 0.001, 0.999);
  const eligible = eligibilityProbability >= 0.5 && f.disposableIncome > 0;

  const foir = SCENARIO_FOIR[a.emiScenario] ?? 0.4;
  const foirCap = Math.max(a.monthlySalary * foir - a.currentEmi, 0);
  const capacityFromCashflow = Math.max(f.disposableIncome, 0) * (0.55 + 0.25 * f.creditStrength);
  const rawEmi = Math.min(foirCap, capacityFromCashflow) * (eligible ? 1 : 0.35);
  const maxMonthlyEmi = Math.round(Math.max(rawEmi, 0) / 100) * 100;

  const drivers = [
    {
      label: "Credit history",
      impact: creditRisk,
      detail: `Credit score ${a.creditScore} (${Math.round(f.creditStrength * 100)}% strength)`,
    },
    {
      label: "Affordability",
      impact: affordabilityRisk,
      detail: `Disposable income ratio ${(f.affordabilityRatio * 100).toFixed(1)}%`,
    },
    {
      label: "Existing debt",
      impact: debtRisk,
      detail: `Debt-to-income ${(f.debtToIncome * 100).toFixed(1)}%`,
    },
    {
      label: "Employment stability",
      impact: stabilityRisk,
      detail: `${a.employmentType}, ${a.yearsOfEmployment} yrs`,
    },
    {
      label: "Liquidity buffer",
      impact: liquidityRisk,
      detail: `${f.savingsRunwayMonths.toFixed(1)} months of runway`,
    },
    {
      label: "Dependents",
      impact: dependentRisk,
      detail: `${a.dependents} dependent(s)`,
    },
  ].sort((x, y) => y.impact - x.impact);

  const riskBand: AssessmentResult["riskBand"] =
    riskScore < 25 ? "Low" : riskScore < 45 ? "Moderate" : riskScore < 65 ? "Elevated" : "High";

  return {
    features: f,
    riskScore: Math.round(riskScore * 10) / 10,
    riskBand,
    eligibilityProbability,
    eligible,
    maxMonthlyEmi,
    foirCap: Math.round(foirCap),
    drivers,
  };
}

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
