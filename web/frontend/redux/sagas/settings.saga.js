import { all, put, takeLatest } from "redux-saga/effects";
import {
  getSettingsAsync,
  getSettingsSuccess,
  getSettingsFailed,
  saveSettingsAsync,
  saveSettingsSuccess,
  saveSettingsFailed,
} from "../actions/settings.action";
 
const fetchSettings = (jwt) =>
  fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/settings`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
  });

const saveSettings = (jwt, settings) =>
  fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify(settings),
  });

function* fetchSettingsSaga(action) {
  try {
    const jwt = action.payload;
    const [response] = yield all([fetchSettings(jwt)]);
    const [json] = yield all([response.json()]);
    if (json && json.statusCode === 200) {
      yield put(getSettingsSuccess(json.payload));
    } else {
      yield put(getSettingsFailed());
    }
  } catch (e) {
    console.log("ERROR", "[settings.saga.js] fetchSettingsSaga", e.toString());
  }
}

function* saveSettingsSaga(action) {
  try {
    const jwt = action.payload.jwt;
    const settings = action.payload.settings;
    const [response] = yield all([saveSettings(jwt, settings)]);
    const [json] = yield all([response.json()]);
    if (json && json.statusCode === 200) {
      yield put(saveSettingsSuccess());
    } else {
      yield put(saveSettingsFailed());
    }
  } catch (e) {
    console.log("ERROR", "[settings.saga.js] saveSettingsSaga", e.toString());
  }
}

export default function* handleShop() {
  yield takeLatest(getSettingsAsync, fetchSettingsSaga);
  yield takeLatest(saveSettingsAsync, saveSettingsSaga);
}
