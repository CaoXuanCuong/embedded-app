import { combineReducers } from "@reduxjs/toolkit";
import { generalSlice } from "./general.reducer";
import { settingsSlice } from "./settings.reducer";
import { sessionsSlice } from "./sessions.reducer";
import { surveySlice } from "./survey.reducer";

const reducer = combineReducers({
  [generalSlice.name]: generalSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
  [sessionsSlice.name]: sessionsSlice.reducer,
  [surveySlice.name]: surveySlice.reducer,
});

export { reducer };
