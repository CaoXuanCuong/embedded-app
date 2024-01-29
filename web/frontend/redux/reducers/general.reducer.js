import { createSlice } from "@reduxjs/toolkit";
import {
  SAGA_GET_SHOP_DATA_SUCCESS,
  SAGA_GET_SHOP_DATA_FAILED,
} from "../actions/general.action";

const initialState = {
  isAuthenticated: false,
  mobileNavigation: false,
  isShowPopup: false,
  shop: {
    name: "",
    email: "",
    domain: "",
    myshopifyDomain: "",
    shopifyPlan: "",
    usage: 0,
    quota: 400,
    appPlanName: "FREE",
    appPlanCode: "free",
    trial_day_left: "",
    price: "",
    subscription_billing_on: "",
    countSession: 0,
    sub_bfcm: false,
  },
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  // client side
  reducers: {
    toggleMobileNavigation: (state) => {
      return {
        ...state,
        mobileNavigation: !state.mobileNavigation,
      };
    },
    setPlanShop: (state, action) => {
      state.shop.appPlanCode = action.payload;
    },
  },
  // server side
  extraReducers: (builder) => {
    builder.addCase(SAGA_GET_SHOP_DATA_SUCCESS, (state, action) => {
      let isShowPopup = false;
      if (
        action.payload.usage &&
        action.payload.quota &&
        ((action.payload.usage >= 350 && action.payload.quota === 400) ||
          action.payload.usage / action.payload.quota >= 0.75)
      ) {
        isShowPopup = true;
      }
      return {
        ...state,
        isAuthenticated: true,
        isShowPopup: isShowPopup,
        shop: {
          ...state.shop,
          name: action.payload.name,
          email: action.payload.email,
          sub_bfcm: action.payload.sub_bfcm,
          domain: action.payload.domain,
          myshopifyDomain: action.payload.myshopify_domain,
          usage: action.payload.usage,
          quota: action.payload.quota,
          appPlanName: action.payload.appPlanName,
          appPlanCode: action.payload.appPlanCode,
          shopifyPlan: action.payload.plan_name ? action.payload.plan_name : "",
          trial_day_left: action.payload.remain_trial_days ? action.payload.remain_trial_days : 0,
          price: action.payload.amount,
          subscription_billing_on: action.payload.start_trial_date
            ? action.payload.start_trial_date
            : null,
          countTotalSession: action.payload.countTotalSession
            ? action.payload.countTotalSession
            : 0,
        },
      };
    });
    builder.addCase(SAGA_GET_SHOP_DATA_FAILED, (state) => {
      return {
        ...state,
        isAuthenticated: false,
      };
    });
  },
});

export const selectGeneral = (state) => state.general;

export const selectIsLoading = (state) => state.general.isLoading;
export const selectMobileNavigation = (state) => state.general.mobileNavigation;
export const selectShop = (state) => state.general.shop;

export const { toggleMobileNavigation, setPlanShop } = generalSlice.actions;

export default generalSlice.reducer;
