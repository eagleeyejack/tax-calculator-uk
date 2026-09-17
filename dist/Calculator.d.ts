import { CalculatorOptions } from "./Interfaces";
import { TAX_YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS } from "./TaxYears";
export { TAX_YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS };
declare const Calculator: (grossIncome: number, options: CalculatorOptions, taxYear?: string) => any;
export default Calculator;
