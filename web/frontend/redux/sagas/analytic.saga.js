import { call, delay, put, select, takeLatest } from "redux-saga/effects";
import { analyticActions } from "../reducers/analytic.reducer";
import { analyticApi } from "../../services/analytic.service";

function* fetchVisitor(filter) {
  yield delay(2000);
  const prevFetching = yield select((state) => state.analytic.fetching);
  try {
    const { data } = yield call(analyticApi.getVisitors, filter);

    yield put(analyticActions.setUniqueVisitors(data));
    yield put(analyticActions.setFetching({ ...prevFetching, visitors: "Success" }));
  } catch (error) {
    yield put(analyticActions.setFetching({ ...prevFetching, visitors: "Error" }));
  }
}

function* fetchSession(filter) {
  const prevFetching = yield select((state) => state.analytic.fetching);
  try {
    const { data } = yield call(analyticApi.getSessions, filter);

    yield put(analyticActions.setSessions(data));
    yield put(analyticActions.setFetching({ ...prevFetching, sessions: "Success" }));
  } catch (error) {
    yield put(analyticActions.setFetching({ ...prevFetching, sessions: "Error" }));
  }
}

function* fetchTopPage(filter) {
  const prevFetching = yield select((state) => state.analytic.fetching);
  try {
    const { data } = yield call(analyticApi.getTopPages, filter);

    yield put(analyticActions.setTopPages(data));
    yield put(analyticActions.setFetching({ ...prevFetching, topPages: "Success" }));
  } catch (error) {
    yield put(analyticActions.setFetching({ ...prevFetching, topPages: "Error" }));
  }
}

function* fetchOrderFunnel(filter) {
  const prevFetching = yield select((state) => state.analytic.fetching);
  try {
    const { data } = yield call(analyticApi.orderFunnel, filter);

    yield put(analyticActions.setOrderFunnel(data));
    yield put(analyticActions.setFetching({ ...prevFetching, funnel: "Success" }));
  } catch (error) {
    yield put(analyticActions.setFetching({ ...prevFetching, funnel: "Error" }));
  }
}

function* handleFetchAnalytic(action) {
  try {
    const {
      jwt,
      dateOption: {
        period: { since, until },
      },
      limit,
    } = action.payload;
    const filter = {
      jwt,
      startDate: new Date(since).toISOString(),
      endDate: new Date(until).toISOString(),
      limit,
    };
    yield fetchSession(filter);
    yield fetchTopPage(filter);
    yield fetchOrderFunnel(filter);
    yield fetchVisitor(filter);
    yield put(analyticActions.fetchAnalyticSuccess());
  } catch (error) {
    yield put(analyticActions.fetchAnalyticFailure());
  }
}

export default function* analyticSaga() {
  yield takeLatest(analyticActions.fetchAnalytic.type, handleFetchAnalytic);
}
