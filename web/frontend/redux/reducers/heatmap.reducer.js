const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  filter: {
    date: {
      title: "Last 30 days",
      type: "last30days",
      start: new Date(
        new Date(new Date().setDate(new Date().getDate() - 30)).setHours(0, 0, 0, 0),
      ).toISOString(),
      end: new Date(new Date(new Date()).setHours(23, 59, 59)).toISOString(),
    },
    queryTitle: "",
  },
};

export const heatmapSlice = createSlice({
  name: "heatmap",
  initialState: initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

// actions
export const heatmapActions = heatmapSlice.actions;

// selectors
export const selectHeatmapFilter = (state) => state.heatmap.filter;

// reducer
export const heatmapReducer = heatmapSlice.reducer;
