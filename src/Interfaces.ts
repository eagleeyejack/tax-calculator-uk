export interface TaxSettings {
	readonly year: string;
	readonly allowance: Allowance;
	readonly incomeTax: IncomeTax;
	readonly nationalInsurance: NationalInsurance;
	readonly studentLoan: StudentLoan;
}

export interface Allowance {
	readonly basic: number;
	readonly age_65_74: number;
	readonly age_75_over: number;
	readonly blind: number;
	readonly thresholds: AllowanceThresholds;
}

export interface AllowanceThresholds {
	readonly age: number;
	readonly taper: number;
}

export interface IncomeTax {
	readonly rate_0: TaxRate;
	readonly rate_20: TaxRate;
	readonly rate_40: TaxRate;
	readonly rate_45: TaxRate;
}

export interface TaxRate {
	readonly start: number;
	readonly end: number;
	readonly rate: number;
}

export interface NationalInsurance {
	readonly pensionAge: number;
	readonly rate_0: TaxRate;
	/** Main employee rate (8% in 2026/27). Name kept as rate_12 for backward compatibility. */
	readonly rate_12: TaxRate;
	readonly rate_2: TaxRate;
}

export interface StudentLoan {
	readonly plan_1: StudentLoanPlanSetting;
	readonly plan_2: StudentLoanPlanSetting;
	readonly plan_4: StudentLoanPlanSetting;
	readonly plan_5: StudentLoanPlanSetting;
	readonly postgraduate: StudentLoanPlanSetting;
}

export interface StudentLoanPlanSetting {
	readonly threshold: number;
	readonly rate: number;
}

export interface CalculatorOptions {
	age: number;
	studentLoanPlan: StudentLoanPlans;
	blind: boolean;
	pensionPercentage: number;
}

/**
 * Numeric values 0/1/2 are unchanged from v1 so existing callers keep working.
 * New in v2: PLAN_4 (3), PLAN_5 (4), POSTGRADUATE (5).
 */
export const enum StudentLoanPlans {
	NO_PLAN = 0,
	PLAN_1 = 1,
	PLAN_2 = 2,
	PLAN_4 = 3,
	PLAN_5 = 4,
	POSTGRADUATE = 5
}

export interface IncomeTaxBreakdown {
	readonly rate_0: TaxBreakdownItem;
	readonly rate_20: TaxBreakdownItem;
	readonly rate_40: TaxBreakdownItem;
	readonly rate_45: TaxBreakdownItem;
}

export interface TaxBreakdownItem {
	readonly tax: number;
	readonly carry?: number;
}

export interface NationalInsuranceBreakdown {
	readonly rate_0: TaxBreakdownItem;
	readonly rate_12: TaxBreakdownItem;
	readonly rate_2: TaxBreakdownItem;
}
