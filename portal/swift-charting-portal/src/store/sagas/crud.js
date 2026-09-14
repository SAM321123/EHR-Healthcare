import {
  put, call, all, delay,
} from 'redux-saga/effects';
import { batchActions } from 'redux-batched-actions';
import {
  REQUEST_READ,
  setReadData,
  setReadError,
  setReadLoading,
  REQUEST_CREATE,
  setCreateData,
  setCreateLoading,
  setCreateError,
  setUpdateData,
  setUpdateLoading,
  setUpdateError,
  setDeleteData,
  setDeleteError,
  setDeleteLoading,
  REQUEST_UPDATE,
  REQUEST_DELETE,
  REQUEST_CREATE_WITH_DEBOUNCE,
} from '../actions/crud';
import {
  createSaga, deleteSaga, updateSaga, customTakeLatest,
} from './helper';

import api from '../../api';

export const readSaga = function* ({
  id, url, params, responseModifier,
}) {
  yield put(setReadLoading(id, true));
  try {
    let response = yield call(api.get, {
      url,
      params,
    });
    if(responseModifier && typeof responseModifier==='function'){
      response=responseModifier(response)
    }
    yield put(
      setReadData(id, response),
    );
  } catch (e) {
    console.log('<<<<<<<< readSaga >>>>>>>>>>>>>', e, e.message);
    if (e && e.message !== 'REQUEST_CANCELLED_SESSION_TIMEOUT') {
      yield put(batchActions([
        setReadError(id, e),
        // logoutHandler(e),
      ]));
    } else {
      yield put(batchActions([
        setReadLoading(id, false),
        // logoutHandler(e),
      ]));
    }
  }
};

const debounceCreateSaga = function* (params) {
  yield delay(2000); // <= here you debounce <input/> typing
  yield createSaga({ setCreateLoading, setCreateData, setCreateError })(params);
};

export default function* root() {
  yield all([
    customTakeLatest(REQUEST_READ, readSaga),
    customTakeLatest(
      REQUEST_CREATE,
      createSaga({ setCreateLoading, setCreateData, setCreateError }),
    ),
    customTakeLatest(
      REQUEST_UPDATE,
      updateSaga({ setUpdateLoading, setUpdateData, setUpdateError }),
    ),
    customTakeLatest(
      REQUEST_DELETE,
      deleteSaga({ setDeleteLoading, setDeleteData, setDeleteError }),
    ),
    customTakeLatest(REQUEST_CREATE_WITH_DEBOUNCE, debounceCreateSaga),
  ]);
}
