import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
    shopInfo: {
        fetchStatus: "idle",
        shopId: null,
        status: null,
        planName: null,
        planCode: null,
        isUploadToTheme: null,
        intervalSubscriptions: null,
        accessKey: null,
        storeOwner: {
            shop: null,
        },
    },
    shopModulesInfo: {
        fetchStatus: "idle",
        updateStatus: "idle",
        shopModules: null,
        modules: null,
    },
};

export const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        getShop: (state) => {
            state.shopInfo.fetchStatus = "loading";
        },
        getShopDone: (state, action) => {
            const getShopRes = action.payload;
            if (getShopRes?.success) {
                state.shopInfo = getShopRes.data;
                state.shopInfo.fetchStatus = "success";
            } else {
                state.shopInfo.fetchStatus = "fail";
            }
        },
        getShopModules: (state) => {
            state.shopModulesInfo.fetchStatus = "loading";
        },
        getShopModulesDone: (state, action) => {
            const getShopModuleRes = action.payload;
            if (getShopModuleRes?.success) {
                const { shopModules, modules } = getShopModuleRes.data || {};
                state.shopModulesInfo.modules = modules;
                state.shopModulesInfo.shopModules = shopModules;
                state.shopModulesInfo.fetchStatus = "success";
            } else {
                state.shopModulesInfo.fetchStatus = "fail";
            }
        },
        updateShopModule: (state) => {
            state.shopModulesInfo.updateStatus = "loading";
        },
        updateShopModulesDone: (state, action) => {
            const updateShopModuleRes = action.payload;
            if (updateShopModuleRes?.success) {
                const { shopModules } = updateShopModuleRes || {};
                state.shopModulesInfo.shopModules = shopModules;
                state.shopModulesInfo.updateStatus = "success";
            } else {
                state.shopModulesInfo.updateStatus = "fail";
            }
        },
    },
});

export const selectShop = (state) => {
    return state.shop.shopInfo;
};
export const selectStoreOwner = createSelector([selectShop], (shop) => {
    return shop?.storeOwner?.shop;
});

export const selectShopModules = (state) => {
    return state.shop?.shopModulesInfo;
};

export const shopActions = shopSlice.actions;
export default shopSlice.reducer;

