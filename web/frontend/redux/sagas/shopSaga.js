import { call, put, takeLatest } from 'redux-saga/effects';
import { shopActions } from '../slices/shopSlice';

function* getShopInfo({ payload }) {
    const { domain } = payload || {};
    const abortCtrl = new AbortController();
    try {
        const response = yield call("http", domain, abortCtrl.signal);
        if (response?.success) {
            yield put(
                shopActions.getShopDone({
                    success: true,
                    data: response.shop,
                })
            );
        }
    } catch (error) {
        shopActions.getShopDone({
            success: false,
        });
    } finally {
        abortCtrl.abort();
    }
}

function* updateShopModules(actions) {
    const { payload, callback } = actions;
    delete actions.callback;
    const { domain, modifiedModules } = payload;
    const abortCtrl = new AbortController();
    try {
        const response = yield call("http", { domain, modifiedModules, signal: abortCtrl.signal });
        typeof callback === 'function' && callback(response);
        if (response.success) {
            yield put(
                shopActions.updateShopModulesDone({
                    success: true,
                    shopModules: response?.shopModules || [],
                })
            );
        }
    } catch (error) {
        typeof callback === 'function' && callback(error);
        yield put(
            shopActions.updateShopModulesDone({
                success: false,
            })
        );
    } finally {
        abortCtrl.abort();
    }
}

function* getShopModules({ payload }) {
    const domain = payload;
    const abortCtrl = new AbortController();
    try {
        const response = yield call("http", domain, abortCtrl.signal);
        if (response.success) {
            yield put(
                shopActions.getShopModulesDone({
                    success: true,
                    data: {
                        modules: response?.modules || [],
                        shopModules: response?.shopModules || [],
                    },
                })
            );
        }
    } catch (error) {
        yield put(
            shopActions.getShopModulesDone({
                success: false,
            })
        );
    } finally {
        abortCtrl.abort();
    }
}

export function* shopSaga() {
    yield takeLatest(shopActions.getShop.type, getShopInfo);
    yield takeLatest(shopActions.getShopModules.type, getShopModules);
    yield takeLatest(shopActions.updateShopModule.type, updateShopModules);
}

