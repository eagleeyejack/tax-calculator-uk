"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TAX_YEAR = exports.SUPPORTED_TAX_YEARS = exports.TAX_YEARS = void 0;
const Settings_1 = require("./17-18/Settings");
const Settings_2 = require("./18-19/Settings");
const Settings_3 = require("./19-20/Settings");
const Settings_4 = require("./20-21/Settings");
const Settings_5 = require("./21-22/Settings");
const Settings_6 = require("./22-23/Settings");
const Settings_7 = require("./23-24/Settings");
const Settings_8 = require("./24-25/Settings");
const Settings_9 = require("./25-26/Settings");
const Settings_10 = require("./26-27/Settings");
exports.TAX_YEARS = {
    "2017/18": Settings_1.TAX_SETTINGS,
    "2018/19": Settings_2.TAX_SETTINGS,
    "2019/20": Settings_3.TAX_SETTINGS,
    "2020/21": Settings_4.TAX_SETTINGS,
    "2021/22": Settings_5.TAX_SETTINGS,
    "2022/23": Settings_6.TAX_SETTINGS,
    "2023/24": Settings_7.TAX_SETTINGS,
    "2024/25": Settings_8.TAX_SETTINGS,
    "2025/26": Settings_9.TAX_SETTINGS,
    "2026/27": Settings_10.TAX_SETTINGS
};
exports.SUPPORTED_TAX_YEARS = Object.keys(exports.TAX_YEARS);
exports.DEFAULT_TAX_YEAR = "2026/27";
