import { createSlice } from "@reduxjs/toolkit";
import {
  getSettingsSuccess,
  getSettingsFailed,
  saveSettingsSuccess,
  saveSettingsFailed,
} from "../actions/settings.action";
import {
  cookieBarContentMessage,
  cookieBarContentPrivacyPolicyUrl,
  cookieBarContentOkButtonText,
  cookieBarContentInfoLinkText,
} from "../../consts/CookieBarContent.const";

const initialState = {
  replaySettings: {
    speed: "1",
    autoplay: "true",
  },
  excludeVisitorSettings: {
    ips: [],
    countries: [],
  },
  // sessionTarget: {
  //   minimalDuration: 5,
  // },
  sessionSettings: {
    collectEmail: "false",
    showCookiesBar: "false",
    cookiesBarContent: {
      message: cookieBarContentMessage,
      privacyPolicyUrl: cookieBarContentPrivacyPolicyUrl,
      okButtonText: cookieBarContentOkButtonText,
      infoLinkText: cookieBarContentInfoLinkText,
    },
  },
  fetchResult: null,
  saveResult: null,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    discardSettings: (state, action) => {
      state.replaySettings.speed = action.payload.replay_speed;
      state.replaySettings.autoplay = action.payload.replay_autoplay;
      state.excludeVisitorSettings.ips = [...action.payload.excluded_ips].sort();
      state.excludeVisitorSettings.countries = action.payload.excluded_countries;
      // state.sessionTarget.minimalDuration = action.payload.min_duration;
      state.sessionSettings.collectEmail = action.payload.collect_email;
      state.sessionSettings.showCookiesBar = action.payload.show_cookies_bar;
      state.sessionSettings.cookiesBarContent = action.payload.cookies_bar_content;
    },
    setSpeed: (state, action) => {
      state.replaySettings.speed = action.payload;
    },
    setAutoplay: (state, action) => {
      state.replaySettings.autoplay = action.payload;
    },
    addExcludedIp: (state, action) => {
      state.excludeVisitorSettings.ips.push(action.payload);
    },
    setExcludedCountry: (state, action) => {
      state.excludeVisitorSettings.countries = action.payload;
    },
    removeExcludedIp: (state, action) => {
      state.excludeVisitorSettings.ips = state.excludeVisitorSettings.ips.filter(
        (prevIp) => prevIp !== action.payload,
      );
    },
    // setMinimalDuration: (state, action) => {
    //   state.sessionTarget.minimalDuration = action.payload;
    // },
    setCollectEmail: (state, action) => {
      state.sessionSettings.collectEmail = action.payload;
    },
    setShowCookiesBar: (state, action) => {
      state.sessionSettings.showCookiesBar = action.payload;
    },
    setCookiesBarContent: (state, action) => {
      const { key, value } = action.payload;
      switch (key) {
        case "message":
          state.sessionSettings.cookiesBarContent.message = value;
          break;
        case "privacyPolicyUrl":
          state.sessionSettings.cookiesBarContent.privacyPolicyUrl = value;
          break;
        case "okButtonText":
          state.sessionSettings.cookiesBarContent.okButtonText = value;
          break;
        case "infoLinkText":
          state.sessionSettings.cookiesBarContent.infoLinkText = value;
          break;
      }
    },
    resetSaveResult: (state) => {
      state.saveResult = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSettingsSuccess, (state, action) => {
      const cookiesBarContent = action.payload.cookies_bar_content;
      return {
        ...state,
        fetchResult: true,
        replaySettings: {
          speed: action.payload.replay_speed.toString(),
          autoplay: action.payload.replay_autoplay.toString(),
        },
        excludeVisitorSettings: {
          ips: action.payload.excluded_ips,
          countries: action.payload.excluded_countries,
        },
        // sessionTarget: {
        //   minimalDuration: action.payload.min_duration,
        // },
        sessionSettings: {
          collectEmail: action.payload.collect_email.toString(),
          showCookiesBar: action.payload.show_cookies_bar.toString(),
          cookiesBarContent: {
            message:
              cookiesBarContent && cookiesBarContent.message
                ? cookiesBarContent.message
                : cookieBarContentMessage,
            privacyPolicyUrl:
              cookiesBarContent && cookiesBarContent.privacyPolicyUrl
                ? cookiesBarContent.privacyPolicyUrl
                : cookieBarContentPrivacyPolicyUrl,
            okButtonText:
              cookiesBarContent && cookiesBarContent.okButtonText
                ? cookiesBarContent.okButtonText
                : cookieBarContentOkButtonText,
            infoLinkText:
              cookiesBarContent && cookiesBarContent.infoLinkText
                ? cookiesBarContent.infoLinkText
                : cookieBarContentInfoLinkText,
          },
        },
      };
    });
    builder.addCase(getSettingsFailed, (state) => {
      return {
        ...state,
        fetchResult: false,
      };
    });
    builder.addCase(saveSettingsSuccess, (state) => {
      return {
        ...state,
        saveResult: true,
      };
    });
    builder.addCase(saveSettingsFailed, (state) => {
      return {
        ...state,
        saveResult: false,
      };
    });
  },
});

export const selectSettings = (state) => state.settings;

export const selectReplaySettings = (state) => state.settings.replaySettings;
export const selectExcludeVisitorSettings = (state) => state.settings.excludeVisitorSettings;
// export const selectSessionTarget = (state) => state.settings.sessionTarget;
export const selectSessionSettings = (state) => state.settings.sessionSettings;

export const selectFetchResult = (state) => state.settings.fetchResult;
export const selectSaveResult = (state) => state.settings.saveResult;

export const {
  discardSettings,
  setSpeed,
  setAutoplay,
  addExcludedIp,
  setExcludedCountry,
  removeExcludedIp,
  // setMinimalDuration,
  setCollectEmail,
  setShowCookiesBar,
  setCookiesBarContent,
  resetSaveResult,
} = settingsSlice.actions;

export default settingsSlice.reducer;
