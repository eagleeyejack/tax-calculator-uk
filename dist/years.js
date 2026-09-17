"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TAX_YEAR = exports.SUPPORTED_TAX_YEARS = exports.YEARS = void 0;
// One row per tax year. Scotland bands are [name, width, rate] slices of
// TAXABLE income (width 0 = remainder); published thresholds equal
// standard PA + cumulative widths. rUK needs only basic-band width (bb)
// and the additional-rate threshold (at), both on taxable income.
// sl = [plan1, plan2, plan4, plan5, postgrad, plan5rate] (postgrad always 6%,
// other undergrad plans 9%; plan 5 rate 0 before repayments began Apr 2026).
// ni = [mainRate, primaryThreshold, upperEarningsLimit] (upper rate always 2%).
exports.YEARS = {
    "2026/27": {
        pa: 12570, bb: 37700, at: 125140, blind: 3250,
        ni: [0.08, 12570, 50270], penAge: 66,
        sl: [26900, 29385, 33795, 25000, 21000, 0.09],
        scot: [["starter", 3967, 0.19], ["basic", 12989, 0.2], ["intermediate", 14136, 0.21], ["higher", 31338, 0.42], ["advanced", 50140, 0.45], ["top", 0, 0.48]]
    },
    "2025/26": {
        pa: 12570, bb: 37700, at: 125140, blind: 3130,
        ni: [0.08, 12570, 50270], penAge: 66,
        sl: [26065, 28470, 32745, 25000, 21000, 0],
        scot: [["starter", 2827, 0.19], ["basic", 12094, 0.2], ["intermediate", 16171, 0.21], ["higher", 31338, 0.42], ["advanced", 50140, 0.45], ["top", 0, 0.48]]
    },
    "2024/25": {
        pa: 12570, bb: 37700, at: 125140, blind: 3070,
        ni: [0.08, 12570, 50270], penAge: 66,
        sl: [24990, 27295, 31395, 25000, 21000, 0],
        scot: [["starter", 2827, 0.19], ["basic", 12094, 0.2], ["intermediate", 16171, 0.21], ["higher", 31338, 0.42], ["advanced", 50140, 0.45], ["top", 0, 0.48]]
    },
    "2023/24": {
        pa: 12570, bb: 37700, at: 125140, blind: 2870,
        ni: [0.115, 12570, 50270], penAge: 66, // blended 12% Apr-Dec, 10% Jan-Mar
        sl: [22015, 27295, 27660, 25000, 21000, 0],
        scot: [["starter", 2162, 0.19], ["basic", 10956, 0.2], ["intermediate", 17944, 0.21], ["higher", 81508, 0.42], ["top", 0, 0.47]]
    },
    "2022/23": {
        pa: 12570, bb: 37700, at: 150000, blind: 2600,
        ni: [0.1273, 11908, 50270], penAge: 66, // blended 13.25% Apr-Nov (levy), 12% Nov-Mar; PT annualised
        sl: [20195, 27295, 25375, 25000, 21000, 0],
        scot: [["starter", 2162, 0.19], ["basic", 10956, 0.2], ["intermediate", 17974, 0.21], ["higher", 106338, 0.41], ["top", 0, 0.46]]
    },
    "2021/22": {
        pa: 12570, bb: 37700, at: 150000, blind: 2520,
        ni: [0.12, 9568, 50270], penAge: 66,
        sl: [19895, 27295, 25000, 25000, 21000, 0],
        scot: [["starter", 2097, 0.19], ["basic", 10629, 0.2], ["intermediate", 18366, 0.21], ["higher", 106338, 0.41], ["top", 0, 0.46]]
    },
    "2020/21": {
        pa: 12500, bb: 37500, at: 150000, blind: 2500,
        ni: [0.12, 9500, 50000], penAge: 66,
        sl: [19390, 26575, 19390, 25000, 21000, 0], // Scottish loans used Plan 1 thresholds
        scot: [["starter", 2085, 0.19], ["basic", 10573, 0.2], ["intermediate", 18272, 0.21], ["higher", 106570, 0.41], ["top", 0, 0.46]]
    },
    "2019/20": {
        pa: 12500, bb: 37500, at: 150000, blind: 2450,
        ni: [0.12, 8632, 50000], penAge: 66,
        sl: [18935, 25725, 18935, 25000, 21000, 0], // Scottish loans used Plan 1 thresholds
        scot: [["starter", 2049, 0.19], ["basic", 10395, 0.2], ["intermediate", 18486, 0.21], ["higher", 106570, 0.41], ["top", 0, 0.46]]
    },
    "2018/19": {
        pa: 11850, bb: 34500, at: 150000, blind: 2390,
        ni: [0.12, 8424, 46384], penAge: 65,
        sl: [18330, 25000, 18330, 25000, 21000, 0], // Scottish loans used Plan 1 thresholds
        scot: [["starter", 2000, 0.19], ["basic", 10150, 0.2], ["intermediate", 19430, 0.21], ["higher", 106570, 0.41], ["top", 0, 0.46]]
    },
    "2017/18": {
        pa: 11500, bb: 33500, at: 150000, blind: 2320,
        ni: [0.12, 8164, 45032], penAge: 65,
        sl: [17775, 21000, 17775, 25000, 21000, 0], // Scottish loans used Plan 1 thresholds
        scot: [["basic", 31500, 0.2], ["higher", 107000, 0.4], ["top", 0, 0.45]] // same rates as rUK, HRT £43,000
    }
};
exports.SUPPORTED_TAX_YEARS = Object.keys(exports.YEARS);
exports.DEFAULT_TAX_YEAR = "2026/27";
