import { all } from "redux-saga/effects";
import { shopSaga } from "./shopSaga";

export default function* rootSaga() {
  yield all([yield fork(shopSaga)]);
}

