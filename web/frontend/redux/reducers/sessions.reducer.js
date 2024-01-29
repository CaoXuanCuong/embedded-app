import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filterMode: "DEFAULT",
  filter: {
    event: [],
    visited_page: [],
    exit_page: [],
    duration: [],
    device: [],
    browser: [],
    operating_system: [],
    location: [],
    page_per_session: [],
  },
  selected: null,
  selectedFilter: 0,
  selectedList: null,
};

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setFilterMode: (state, action) => {
      state.filterMode = action.payload;
    },
    setSelectedList: (state, action) => {
      state.selectedList = action.payload;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    setFilterSelected: (state, action) => {
      state.selectedFilter = action.payload;
    },
  },
});

export const filterReducer = (state, action) => {
  switch (action.type) {
    case "event":
      return {
        ...state,
        event: action.payload,
      };
    case "visited_page":
      return {
        ...state,
        visited_page: action.payload,
      };
    case "exit_page":
      return {
        ...state,
        exit_page: action.payload,
      };
    case "device":
      return {
        ...state,
        device: action.payload,
      };
    case "duration":
      return {
        ...state,
        duration: action.payload,
      };
    case "browser":
      return {
        ...state,
        browser: action.payload,
      };
    case "operating_system":
      return {
        ...state,
        operating_system: action.payload,
      };
    case "location":
      return {
        ...state,
        location: action.payload,
      };
    case "page_per_session":
      return {
        ...state,
        page_per_session: action.payload,
      };
    case "all":
      return action.payload;
    default:
      console.error("Must implement action type: ", action.type);
  }
};

export const selectFilter = (state) => state.sessions.filter;
export const selectFilterSelected = (state) => state.sessions.selectedFilter;
export const selectSessionSelected = (state) => state.sessions.selected;
export const selectSessionSelectedList = (state) => state.sessions.selectedList;
export const selectFitlerMode = (state) => state.sessions.filterMode;
export const { setSelected, setFilterSelected, setSelectedList, setFilterMode } =
  sessionsSlice.actions;
export default sessionsSlice.reducer;
