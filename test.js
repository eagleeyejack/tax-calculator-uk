const Calculator = require("./dist/Calculator").default;

const close = (a, b) => Math.abs(a - b) < 0.01;
let fail = 0;
const check = (label, actual, expected) => {
	const ok = close(actual, expected);
	if (!ok) fail++;
	console.log(`${ok ? "PASS" : "FAIL"} ${label}: got ${actual}, want ${expected}`);
};
const checkExact = (label, actual, expected) => {
	const ok = actual === expected;
	if (!ok) fail++;
	console.log(`${ok ? "PASS" : "FAIL"} ${label}: got ${actual}, want exactly ${expected}`);
};

const base = (plan = 0) => ({ age: 30, studentLoanPlan: plan, blind: false, pensionPercentage: 0 });

// £20k
let r = Calculator(20000, base()).getTaxBreakdown();
check("20k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 1486);
check("20k NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 594.4);
check("20k net", r.netIncome.yearly, 17919.6);
check("20k PA", r.personalAllowance, 12570);

// £60k
r = Calculator(60000, base()).getTaxBreakdown();
check("60k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 11432);
check("60k NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 3210.6);
check("60k net", r.netIncome.yearly, 45357.4);

// £110k (taper zone: PA = 12570 - 5000 = 7570)
r = Calculator(110000, base()).getTaxBreakdown();
check("110k PA", r.personalAllowance, 7570);
check("110k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 33432);
check("110k net", r.netIncome.yearly, 72357.4);

// £130k (PA gone, additional rate)
r = Calculator(130000, base()).getTaxBreakdown();
check("130k PA", r.personalAllowance, 0);
check("130k 45% band", r.paye.rate_45.tax, 2187);
check("130k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 44703);
check("130k net", r.netIncome.yearly, 80686.4);

// Student loans on £35k
check("Plan2 £35k", Calculator(35000, base(2)).getTaxBreakdown().studentLoan.repayment, 505.35);
check("Plan1 £35k", Calculator(35000, base(1)).getTaxBreakdown().studentLoan.repayment, 729);
check("Plan4 £35k", Calculator(35000, base(3)).getTaxBreakdown().studentLoan.repayment, 108.45);
check("Plan5 £35k", Calculator(35000, base(4)).getTaxBreakdown().studentLoan.repayment, 900);
check("Postgrad £35k", Calculator(35000, base(5)).getTaxBreakdown().studentLoan.repayment, 840);

// Pension 5% on £60k
r = Calculator(60000, { age: 30, studentLoanPlan: 0, blind: false, pensionPercentage: 5 }).getTaxBreakdown();
check("60k 5% pension tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 10232);
check("60k 5% pension net", r.netIncome.yearly, 43557.4);

// PA taper is on income after the pension deduction (adjusted net income), not gross pay:
// £110k with 10% pension -> £99k adjusted -> full PA 12,570; taxable 86,430
r = Calculator(110000, { age: 30, studentLoanPlan: 0, blind: false, pensionPercentage: 10 }).getTaxBreakdown();
check("110k 10% pension PA", r.personalAllowance, 12570);
check("110k 10% pension tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 27032);
check("110k 10% pension net", r.netIncome.yearly, 110000 - 11000 - 27032 - 4210.6);
r = Calculator(110000, { age: 30, studentLoanPlan: 0, blind: false, pensionPercentage: 10, region: "scotland" }).getTaxBreakdown();
check("Scot 110k 10% pension PA", r.personalAllowance, 12570);
check("Scot 110k 10% pension tax", r.bands.reduce((s, b) => s + b.tax, 0), 30282.05);
// £200k with 10% pension -> £180k adjusted -> PA still 0
r = Calculator(200000, { age: 30, studentLoanPlan: 0, blind: false, pensionPercentage: 10, region: "scotland" }).getTaxBreakdown();
check("Scot 200k 10% pension PA", r.personalAllowance, 0);
check("Scot 200k 10% pension tax", r.bands.reduce((s, b) => s + b.tax, 0), 74034.35);
check("Scot 200k 10% pension net", r.netIncome.yearly, 99955.05);

// Half-penny amounts round half-up to the penny, through float noise:
// Scotland £12,755.50 -> taxable 185.50 x 19% = 35.245 -> 35.25 (not 35.24)
r = Calculator(12755.5, { age: 30, studentLoanPlan: 0, blind: false, pensionPercentage: 0, region: "scotland" }).getTaxBreakdown();
checkExact("half-penny starter rounds up", r.paye.starter.tax, 35.25);
// rUK £12,570.05 -> taxable 0.05 x 20% = 0.01
r = Calculator(12570.05, base()).getTaxBreakdown();
checkExact("half-penny basic rounds up", r.paye.rate_20.tax, 0.01);
// NI: £12,570.0625 is not a valid input (pence), but 12,580.50 -> 10.50 x 8% = 0.84 exactly
r = Calculator(12580.5, base()).getTaxBreakdown();
checkExact("NI pence", r.nationalInsurance.rate_12.tax, 0.84);
// Pence input through every band: Scotland £33,333.33 -> intermediate 3,807.33 x 21% = 799.5393 -> 799.54
r = Calculator(33333.33, { age: 30, studentLoanPlan: 0, blind: false, pensionPercentage: 0, region: "scotland" }).getTaxBreakdown();
checkExact("Scot £33,333.33 intermediate", r.paye.intermediate.tax, 799.54);
check("Scot £33,333.33 tax", r.bands.reduce((s, b) => s + b.tax, 0), 4151.07);

// State pension age: no employee NI
r = Calculator(60000, { age: 66, studentLoanPlan: 0, blind: false, pensionPercentage: 0 }).getTaxBreakdown();
check("66yo NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 0);

// Blind allowance adds £3,250
r = Calculator(20000, { age: 30, studentLoanPlan: 0, blind: true, pensionPercentage: 0 }).getTaxBreakdown();
check("blind PA total", r.personalAllowance, 12570); // personal allowance itself unchanged
check("blind 20k tax", r.paye.rate_20.tax, 836); // (20000-12570-3250)*0.2 = 836

console.log(r.taxYear === "2026/27" ? "PASS taxYear 2026/27" : "FAIL taxYear");
if (r.taxYear !== "2026/27") fail++;

// ---- Backfilled years (explicit taxYear arg) ----

// 22-23 £60k: same income tax, blended 12.73% NI on annualised PT £11,908
r = Calculator(60000, base(), "2022/23").getTaxBreakdown();
check("22-23 tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 11432);
check("22-23 NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 5078.08);
check("22-23 net", r.netIncome.yearly, 43489.92);

// Additional-rate threshold: £150k in 22-23 vs £125,140 in 26-27 (£160k salary)
r = Calculator(160000, base(), "2022/23").getTaxBreakdown();
check("22-23 45% band", r.paye.rate_45.tax, 4500);
check("22-23 £160k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 56960);
r = Calculator(160000, base(), "2026/27").getTaxBreakdown();
check("26-27 45% band", r.paye.rate_45.tax, 15687);
check("26-27 £160k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 58203);

// 23-24 Plan 1 £30k: (30000-22015)*9%
check("23-24 Plan1 £30k", Calculator(30000, base(1), "2023/24").getTaxBreakdown().studentLoan.repayment, 718.65);
// 23-24 blended 11.5% NI on £60k: 37700*0.115=4335.5 + 194.6
r = Calculator(60000, base(), "2023/24").getTaxBreakdown();
check("23-24 NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 4530.1);

// 24-25 Plan 4 £40k: (40000-31395)*9%
check("24-25 Plan4 £40k", Calculator(40000, base(3), "2024/25").getTaxBreakdown().studentLoan.repayment, 774.45);

// 25-26 Plan 5 not yet repayable (rate 0); Plan 2 £35k: (35000-28470)*9%
check("25-26 Plan5 £35k", Calculator(35000, base(4), "2025/26").getTaxBreakdown().studentLoan.repayment, 0);
check("25-26 Plan2 £35k", Calculator(35000, base(2), "2025/26").getTaxBreakdown().studentLoan.repayment, 587.7);

// 17-18 £30k: PA 11500, 20% on 18500 = 3700; NI 12% on (30000-8164) = 2620.32
r = Calculator(30000, base(), "2017/18").getTaxBreakdown();
check("17-18 tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 3700);
check("17-18 NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 2620.32);
check("17-18 net", r.netIncome.yearly, 23679.68);

// 18-19 £30k: PA 11850, 20% on 18150 = 3630; NI 12% on (30000-8424) = 2589.12
r = Calculator(30000, base(), "2018/19").getTaxBreakdown();
check("18-19 tax", r.paye.rate_20.tax, 3630);
check("18-19 NI", r.nationalInsurance.rate_12.tax, 2589.12);

// 21-22 additional threshold still £150k: £130k has no 45% band
r = Calculator(130000, base(), "2021/22").getTaxBreakdown();
check("21-22 45% band", r.paye.rate_45.tax, 0);

// Unknown year throws
let threw = false;
try { Calculator(30000, base(), "2030/31"); } catch (e) { threw = true; }
console.log(threw ? "PASS unknown year throws" : "FAIL unknown year throws");
if (!threw) fail++;

// ---- Scotland ----
const scot = (plan = 0) => ({ age: 30, studentLoanPlan: plan, blind: false, pensionPercentage: 0, region: "scotland" });

// 26-27 Scotland £60k: 3967@19% + 12989@20% + 14136@21% + 16338@42% = 13182.05
r = Calculator(60000, scot(), "2026/27").getTaxBreakdown();
check("Scot 26-27 region", r.region === "scotland" ? 1 : 0, 1);
check("Scot 26-27 bands", r.bands.length, 6);
check("Scot 26-27 tax", r.bands.reduce((s, b) => s + b.tax, 0), 13182.05);
check("Scot 26-27 starter", r.paye.starter.tax, 753.73);
check("Scot 26-27 net", r.netIncome.yearly, 43607.35);

// 26-27 Scotland £30k: starter 753.73 + basic 2597.8 + intermediate 99.54
r = Calculator(30000, scot(), "2026/27").getTaxBreakdown();
check("Scot 26-27 £30k tax", r.bands.reduce((s, b) => s + b.tax, 0), 3451.07);
check("Scot 26-27 £30k net", r.netIncome.yearly, 25154.53);

// 22-23 Scotland £60k: 410.78 + 2191.20 + 3774.54 + 6698.58 = 13075.10
r = Calculator(60000, scot(), "2022/23").getTaxBreakdown();
check("Scot 22-23 tax", r.bands.reduce((s, b) => s + b.tax, 0), 13075.1);
check("Scot 22-23 net", r.netIncome.yearly, 41846.82);

// 23-24 Scotland £50k: intermediate band ends at 43,662 (17,974 wide): 410.78 + 2191.20 + 3774.54 + 6,338 @ 42% = 9038.48
r = Calculator(50000, scot(), "2023/24").getTaxBreakdown();
check("Scot 23-24 £50k intermediate", r.paye.intermediate.tax, 3774.54);
check("Scot 23-24 £50k tax", r.bands.reduce((s, b) => s + b.tax, 0), 9038.48);

// 17-18 Scotland £44k (HRT £43k vs rUK £45k): 6300 + 400 = 6700
r = Calculator(44000, scot(), "2017/18").getTaxBreakdown();
check("Scot 17-18 tax", r.bands.reduce((s, b) => s + b.tax, 0), 6700);
check("Scot 17-18 net", r.netIncome.yearly, 32999.68);

// 24-25 Scotland £100k hits the advanced band: 438.14 + 2337 + 3591.21 + 13161.96 + 11250 = 30778.31
// (2024/25 starter band ends at 14,876 and basic at 26,561: gov.scot "Scottish Income Tax: rates and bands 2024 to 2025")
r = Calculator(100000, scot(), "2024/25").getTaxBreakdown();
check("Scot 24-25 starter", r.paye.starter.tax, 438.14);
check("Scot 24-25 basic", r.paye.basic.tax, 2337);
check("Scot 24-25 advanced", r.paye.advanced.tax, 11250);
check("Scot 24-25 £100k tax", r.bands.reduce((s, b) => s + b.tax, 0), 30778.31);

// 24-25 Scotland £60k: 438.14 + 2337 + 3591.21 + 16,338 @ 42% = 13228.31
r = Calculator(60000, scot(), "2024/25").getTaxBreakdown();
check("Scot 24-25 £60k tax", r.bands.reduce((s, b) => s + b.tax, 0), 13228.31);

// Scotland with blind allowance: bands anchor to the effective allowance
// PA 0, blind 3,250 -> taxable 126,750: advanced band full (62,710 @ 45% = 28,219.50), top 1,610 @ 48% = 772.80
r = Calculator(130000, { age: 30, studentLoanPlan: 0, blind: true, pensionPercentage: 0, region: "scotland" }, "2026/27").getTaxBreakdown();
check("Scot blind £130k tax", r.bands.reduce((s, b) => s + b.tax, 0), 48474.35);
check("Scot blind £130k net", r.netIncome.yearly, 76915.05);

// The Scottish top band starts where the rUK additional rate starts: the limit is on TAXABLE
// income (Scottish Rate Resolution: "advanced rate ... up to a limit of £125,140"), so the
// cumulative Scottish band widths must sum to the rUK additional-rate threshold in every year.
const { TAX_YEARS } = require("./dist/Calculator");
for (const [year, data] of Object.entries(TAX_YEARS)) {
	const topStart = data.scot.filter(([, width]) => width > 0).reduce((s, [, width]) => s + width, 0);
	check(`${year} Scottish top band starts at taxable`, topStart, data.at);
}

// 26-27 Scotland £125,140 (PA fully tapered, taxable 125,140): advanced band exactly full, no top-rate tax
r = Calculator(125140, scot(), "2026/27").getTaxBreakdown();
check("Scot 26-27 £125,140 advanced", r.paye.advanced.tax, 28219.5);
check("Scot 26-27 £125,140 top", r.paye.top.tax, 0);
check("Scot 26-27 £125,140 tax", r.bands.reduce((s, b) => s + b.tax, 0), 47701.55);

// 26-27 Scotland £130k: top rate on 4,860 (130,000 - 125,140) @ 48% = 2,332.80
r = Calculator(130000, scot(), "2026/27").getTaxBreakdown();
check("Scot 26-27 £130k top", r.paye.top.tax, 2332.8);
check("Scot 26-27 £130k tax", r.bands.reduce((s, b) => s + b.tax, 0), 50034.35);

// 23-24 Scotland £130k: 410.78 + 2191.20 + 3774.54 + higher 94,048 @ 42% = 39,500.16; top 4,860 @ 47% = 2,284.20
r = Calculator(130000, scot(), "2023/24").getTaxBreakdown();
check("Scot 23-24 £130k top", r.paye.top.tax, 2284.2);
check("Scot 23-24 £130k tax", r.bands.reduce((s, b) => s + b.tax, 0), 48160.88);

// 22-23 Scotland £160k: top band starts at taxable 150,000 (as rUK): 10,000 @ 46% = 4,600
r = Calculator(160000, scot(), "2022/23").getTaxBreakdown();
check("Scot 22-23 £160k top", r.paye.top.tax, 4600);
check("Scot 22-23 £160k tax", r.bands.reduce((s, b) => s + b.tax, 0), 59728.8);

// Default region stays England/Wales/NI with legacy paye buckets
r = Calculator(60000, base()).getTaxBreakdown();
check("default region", r.region === "england-wales-ni" ? 1 : 0, 1);
check("EWN bands", r.bands.length, 3);
check("EWN paye buckets", r.paye.rate_20 !== undefined ? 1 : 0, 1);

if (fail) { console.log(`${fail} FAILURES`); process.exit(1); }
console.log("ALL TESTS PASSED");
