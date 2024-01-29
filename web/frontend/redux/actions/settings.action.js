import { createAction } from "@reduxjs/toolkit";

export const getSettingsAsync = createAction("settings/GetSettingsAsync");
export const getSettingsSuccess = createAction("settings/GetSettingSuccess");
export const getSettingsFailed = createAction("settings/GetSettingFailed");

export const saveSettingsAsync = createAction("settings/SaveSettingsAsync");
export const saveSettingsSuccess = createAction("settings/SaveSettingsSuccess");
export const saveSettingsFailed = createAction("settings/SaveSettingsFailed");
