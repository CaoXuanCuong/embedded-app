import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  analytic: {
    surveyId: null,
    tabActive: "summary",
    filter: {
      visitor: {
        page: 1,
        limit: 9,
      },
      feedback: {
        page: 1,
        limit: 9,
      },
    },
  },
};

export const surveySlice = createSlice({
  name: "survey",
  initialState,
  reducers: {
    // Analytics
    setAnalyticSurveyCache: (state, action) => {
      state.analytic.surveyId = action.payload;
    },
    setAnalyticTabActive: (state, action) => {
      state.analytic.tabActive = action.payload;
    },
    setAnalyticFilter: (state, action) => {
      state.analytic.filter[state.analytic.tabActive] = action.payload;
    },
    resetAnalyticFilter: (state, action) => {
      if (action.payload) {
        state.analytic.surveyId = action.payload;
      }
      state.analytic = initialState.analytic;
    },
  },
});

// Actions
export const surveyActions = surveySlice.actions;

// Selectors
export const selectSurveyAnalyticTabActive = (state) => state.survey.analytic.tabActive;
export const selectSurveyAnalyticCache = (state) => state.survey.analytic.surveyId;
export const selectSurveyAnalyticFilter = (state) => state.survey.analytic.filter;

// Reducers
const surveyReducer = surveySlice.reducer;
export default surveyReducer;
