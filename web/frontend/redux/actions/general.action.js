import { createAction } from "@reduxjs/toolkit";

export const SAGA_GET_SHOP_DATA_ASYNC = createAction("general/GetShopDataAsync");
export const SAGA_GET_SHOP_DATA_SUCCESS = createAction("general/GetShopDataSuccess");
export const SAGA_GET_SHOP_DATA_FAILED = createAction("general/GetShopDataFailed");
