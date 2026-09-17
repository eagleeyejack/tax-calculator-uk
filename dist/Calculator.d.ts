import { CalculatorOptions, Region, IncomeTaxBreakdown, NationalInsuranceBreakdown } from "./Interfaces";
import { YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS } from "./years";
export { YEARS as TAX_YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS };
declare const Calculator: (grossIncome: number, options: CalculatorOptions, taxYear?: string) => {
    grossIncome: number;
    options: CalculatorOptions;
    taxYear: string;
    region: Region;
    getTaxBreakdown: () => {
        taxYear: string;
        region: Region;
        netIncome: {
            yearly: number;
            monthly: number;
            weekly: number;
            daily: number;
        };
        personalAllowance: number;
        paye: IncomeTaxBreakdown | Record<string, {
            rate: number;
            tax: number;
        }>;
        bands: {
            name: string;
            rate: number;
            tax: number;
        }[];
        nationalInsurance: NationalInsuranceBreakdown;
        studentLoan: {
            plan: string;
            threshold: number;
            rate: number;
            repayment: number;
        };
    };
};
export default Calculator;
