import { getCountryISO3, initLocationGeoData } from "../../helpers/location.helper";

const { createSlice, createSelector } = require("@reduxjs/toolkit");

const initialState = {
  fetching: {
    sessions: "Success",
    topPages: "Success",
    visitors: "Success",
    funnel: "Success",
  },
  filter: {
    dateOption: null,
    limit: 10,
  },
  options: {
    visitor: "total",
  },
  topPages: [],
  visitors: [],
  uniqueVisitors: [],
  sessions: [],
  orderFunnel: [],
};

export const analyticSlice = createSlice({
  name: "analytic",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setFetching: (state, action) => {
      state.fetching = action.payload;
    },

    fetchAnalytic: (state, action) => {
      state.fetching = {
        sessions: "Loading",
        topPages: "Loading",
        visitors: "Loading",
        uniqueVisitors: "Loading",
      };
    },
    fetchAnalyticSuccess: (state) => {},
    fetchAnalyticFailure: (state) => {},

    setTopPages: (state, action) => {
      state.topPages = action.payload;
    },
    setVisitors: (state, action) => {
      state.visitors = action.payload;
    },
    setUniqueVisitors: (state, action) => {
      state.uniqueVisitors = action.payload;
    },
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    setOrderFunnel: (state, action) => {
      state.orderFunnel = action.payload;
    },
    setOptions: (state, action) => {
      state.options = action.payload;
    },
  },
});

// Actions
export const analyticActions = analyticSlice.actions;

// Selectors
export const selectAnalyticFetching = (state) => state.analytic.fetching;
export const selectAnalyticOptions = (state) => state.analytic.options;
export const selectAnalyticFilter = (state) => state.analytic.filter;
export const selectTopPage = (state) => state.analytic.topPages;
export const selectAnalyticVisitor = (state) => state.analytic.visitors;
export const selectUniqueVisitor = (state) => state.analytic.uniqueVisitors;
export const selectAnalyticSession = (state) => state.analytic.sessions;
export const selectAnalyticFunnel = (state) => state.analytic.orderFunnel;

export const selectVisitorChart = createSelector(
  [selectAnalyticFilter, selectAnalyticVisitor],
  (filter, visitors) => {
    const startDate = new Date(filter?.dateOption?.period?.since);
    const endDate = new Date(filter?.dateOption?.period?.until);
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const dateRange = [];
    for (let i = startTime; i <= endTime; i += 86400000) {
      dateRange.push(new Date(i).toLocaleDateString());
    }

    const data = visitors?.[0]?.visitorsByDate || [];

    let visitorsByDate = dateRange.map((date) => {
      const item = data.find((d) => new Date(d.date).toLocaleDateString() === date);
      return { key: date, value: item ? item.total : 0 };
    });

    if (visitorsByDate?.length === 1) {
      visitorsByDate = [{ key: "", value: 0 }, ...visitorsByDate, { key: "", value: 0 }];
    }

    return {
      name: `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      total: visitors?.[0]?.totalVisitors || 0,
      data: visitorsByDate,
    };
  },
);

export const selectSessionLine = createSelector(
  [selectAnalyticFilter, selectAnalyticSession],
  (filter, sessions) => {
    const startDate = new Date(filter?.dateOption?.period?.since);
    const endDate = new Date(filter?.dateOption?.period?.until);
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const dateRange = [];
    for (let i = startTime; i <= endTime; i += 86400000) {
      dateRange.push(new Date(i).toLocaleDateString());
    }

    const data = sessions?.[0]?.sessionsByDate || [];

    let sessionsByDate = dateRange.map((date) => {
      const item = data.find((d) => new Date(d._id).toLocaleDateString() === date);
      return { key: date, value: item ? item.totalSessions : 0 };
    });

    if (sessionsByDate?.length === 1) {
      sessionsByDate = [{ key: "", value: 0 }, ...sessionsByDate, { key: "", value: 0 }];
    }

    return {
      name: `${startDate?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${endDate?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      total: sessions?.[0]?.totalCount?.[0]?.totalCount || 0,
      data: sessionsByDate,
    };
  },
);

export const selectSuccessOrder = createSelector(
  [selectAnalyticFilter, selectAnalyticFunnel],
  (filter, funnels) => {
    const startDate = new Date(filter?.dateOption?.period?.since);
    const endDate = new Date(filter?.dateOption?.period?.until);
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const dateRange = [];
    for (let i = startTime; i <= endTime; i += 86400000) {
      dateRange.push(new Date(i).toLocaleDateString());
    }

    const data = funnels?.[0]?.successByDate || [];

    let orderByDate = dateRange.map((date) => {
      const item = data.find((d) => new Date(d._id).toLocaleDateString() === date);
      return { key: date, value: item ? item.count : 0 };
    });

    if (orderByDate?.length === 1) {
      orderByDate = [{ key: "", value: 0 }, ...orderByDate, { key: "", value: 0 }];
    }

    return {
      name: `${startDate?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${endDate?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      total: funnels?.[0]?.successByDate?.reduce((total, item) => total + item.count, 0) || 0,
      data: orderByDate,
    };
  },
);

export const selectSessionLocation = createSelector([selectAnalyticSession], (sessions) => {
  const newDataMap = {};
  sessions?.[0]?.sessionsByLocation?.forEach((item) => {
    newDataMap[getCountryISO3(item._id)] = item.totalSessions;
  });
  const geoData = initLocationGeoData.map((obj) => ({
    ...obj,
    value: newDataMap[obj.id] !== undefined ? newDataMap[obj.id] : obj.value,
  }));

  // sessions?.[0]?.sessionsByLocation?.forEach((item) => {

  //   return ({
  //     id: getCountryISO3(item._id),
  //     value: item.totalSessions,
  //   })
  // })
  return {
    data: geoData,
    perList: sessions?.[0]?.sessionsByLocation
      ?.map((item) => ({
        code: item._id,
        percent: Math.round(
          (item.totalSessions / sessions?.[0]?.totalCount?.[0]?.totalCount) * 100,
        ),
      }))
      .sort((a, b) => b.percent - a.percent),
  };
});

export const selectSessionDonut = createSelector([selectAnalyticSession], (sessions) => {
  return {
    browser: sessions?.[0]?.sessionsByBrowser?.map((item) => ({
      name: item._id,
      data: [{ key: "browser", value: item.totalSessions }],
    })),
    device: sessions?.[0]?.sessionsByDevice?.map((item) => ({
      name: item._id,
      data: [{ key: "device", value: item.totalSessions }],
    })),
    os: sessions?.[0]?.sessionsByOs?.map((item) => ({
      name: item._id,
      data: [{ key: "os", value: item.totalSessions }],
    })),
  };
});

export const selectOrderFunnel = createSelector([selectAnalyticFunnel], (funnels) => {
  return [
    {
      name: "Funnel",
      data: [
        { key: "Product View", value: funnels?.[0]?.productView?.[0]?.count ?? 0 },
        { key: "Add to cart", value: funnels?.[0]?.addToCart?.[0]?.count ?? 0 },
        { key: "Checkout", value: funnels?.[0]?.checkout?.[0]?.count ?? 0 },
        { key: "Successful Order", value: funnels?.[0]?.success?.[0]?.count ?? 0 },
      ],
    },
  ];
});

// Reducers
const analyticReducer = analyticSlice.reducer;
export default analyticReducer;
