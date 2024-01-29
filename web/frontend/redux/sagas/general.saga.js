import { all, put, takeLatest } from "redux-saga/effects";
import {
  SAGA_GET_SHOP_DATA_ASYNC,
  SAGA_GET_SHOP_DATA_SUCCESS,
  SAGA_GET_SHOP_DATA_FAILED,
} from "../actions/general.action";

const getShopByDomain = (jwt) =>
  fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/shops?shopifyData=true`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

function* getShopData(action) {
  try {
    const jwt = action.payload;
    const [getShopDataRes] = yield all([getShopByDomain(jwt)]);
    const [getShopDataJson] = yield all([getShopDataRes.json()]);
    if (getShopDataJson && getShopDataJson.statusCode === 200) {
      yield put(SAGA_GET_SHOP_DATA_SUCCESS(getShopDataJson.payload));
    } else {
      yield put(SAGA_GET_SHOP_DATA_FAILED());
    }
  } catch (e) {
    console.log("ERROR", "[general.saga.js] getShopData", e.message);
  }
}

export default function* handleShop() {
  yield takeLatest(SAGA_GET_SHOP_DATA_ASYNC, getShopData);
}
