import { TaxSettings } from "../Interfaces"
import { TAX_SETTINGS as SETTINGS_17_18 } from "./17-18/Settings"
import { TAX_SETTINGS as SETTINGS_18_19 } from "./18-19/Settings"
import { TAX_SETTINGS as SETTINGS_19_20 } from "./19-20/Settings"
import { TAX_SETTINGS as SETTINGS_20_21 } from "./20-21/Settings"
import { TAX_SETTINGS as SETTINGS_21_22 } from "./21-22/Settings"
import { TAX_SETTINGS as SETTINGS_22_23 } from "./22-23/Settings"
import { TAX_SETTINGS as SETTINGS_23_24 } from "./23-24/Settings"
import { TAX_SETTINGS as SETTINGS_24_25 } from "./24-25/Settings"
import { TAX_SETTINGS as SETTINGS_25_26 } from "./25-26/Settings"
import { TAX_SETTINGS as SETTINGS_26_27 } from "./26-27/Settings"

export const TAX_YEARS: Record<string, TaxSettings> = {
	"2017/18": SETTINGS_17_18,
	"2018/19": SETTINGS_18_19,
	"2019/20": SETTINGS_19_20,
	"2020/21": SETTINGS_20_21,
	"2021/22": SETTINGS_21_22,
	"2022/23": SETTINGS_22_23,
	"2023/24": SETTINGS_23_24,
	"2024/25": SETTINGS_24_25,
	"2025/26": SETTINGS_25_26,
	"2026/27": SETTINGS_26_27
}

export const SUPPORTED_TAX_YEARS: string[] = Object.keys(TAX_YEARS)

export const DEFAULT_TAX_YEAR = "2026/27"
