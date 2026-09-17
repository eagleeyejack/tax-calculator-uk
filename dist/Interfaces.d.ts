export type Region = "england-wales-ni" | "scotland";
/** Compact per-year figures. See years.ts for the encoding. */
export interface YearData {
    readonly pa: number;
    readonly bb: number;
    readonly at: number;
    readonly blind: number;
    /** [mainRate, primaryThreshold, upperEarningsLimit]; upper rate always 2%. */
    readonly ni: [number, number, number];
    readonly penAge: number;
    /** [plan1, plan2, plan4, plan5, postgrad, plan5rate]; postgrad always 6%, other undergrad plans 9%. */
    readonly sl: [number, number, number, number, number, number];
    /** [name, width, rate][] slices of taxable income; width 0 = remainder. */
    readonly scot: [string, number, number][];
}
export interface CalculatorOptions {
    age: number;
    studentLoanPlan: StudentLoanPlans;
    blind: boolean;
    pensionPercentage: number;
    /** Defaults to "england-wales-ni". Set to "scotland" for Scottish income tax bands. */
    region?: Region;
}
/**
 * Numeric values 0/1/2 are unchanged from v1 so existing callers keep working.
 */
export declare const enum StudentLoanPlans {
    NO_PLAN = 0,
    PLAN_1 = 1,
    PLAN_2 = 2,
    PLAN_4 = 3,
    PLAN_5 = 4,
    POSTGRADUATE = 5
}
export interface TaxBreakdownItem {
    readonly tax: number;
    readonly carry?: number;
}
export interface IncomeTaxBreakdown {
    readonly rate_0: TaxBreakdownItem;
    readonly rate_20: TaxBreakdownItem;
    readonly rate_40: TaxBreakdownItem;
    readonly rate_45: TaxBreakdownItem;
}
export interface NationalInsuranceBreakdown {
    readonly rate_0: TaxBreakdownItem;
    readonly rate_12: TaxBreakdownItem;
    readonly rate_2: TaxBreakdownItem;
}
