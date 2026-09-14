import {
  cancel, fork, take,
  call, put,
} from 'redux-saga/effects';

// import debounce from 'lodash/debounce';

import { batchActions } from 'redux-batched-actions';
// import { logout } from '../actions/login';
// import Notification from '../../components/Notification';
import api from '../../api';

// const DebouncedNotification = debounce(Notification, 1000);

const mergeUpdatedData = (state, form, key) => {
  const currentTabData = form.get(form.get('currentTab')).toJS();
  const lastFormSavedData = currentTabData[key];
  return { ...state, ...lastFormSavedData };
};

// const logoutHandler = (error) => {
//   const { status } = error.response || {};
//   if (status === 403) {
//     return DebouncedNotification({ message: 'You don\'
//     have rights to access selected operation' });
//   }
//   if (status === 401) {
//     if (!process.env.TEST_ENV) {
//       return logout('REQUEST_CANCELLED_SESSION_TIMEOUT');
//     }
//   }
//   return { type: null };
// };

const createSaga = ({ setCreateLoading, setCreateData, setCreateError }) => function* ({
  id, url, params, cacheResponse, responseModifier,
}) {
  try {
    console.log("🚀 ~ createSaga ~ id:", id,params.data)
    yield put(setCreateLoading(id, true));
    let response = yield call(api.post, {
      url,
      data: params.data,
      params: params.params
    });
    console.log("response in saga",response)
    if (!cacheResponse) {
      if (typeof responseModifier === 'function') {
        response = responseModifier(response);
      }
      yield put(
        setCreateData(id, response),
      );
    }
  } catch (e) {
    // yield put(logoutHandler(e));
    if (!cacheResponse) {
      yield put(setCreateError(id, e));
    }
  } finally {
    yield put(setCreateLoading(id, false));
  }
};

const deleteSaga = ({ setDeleteLoading, setDeleteData, setDeleteError }) =>
  function* ({ id, url, params }) {
    try {
      yield put(setDeleteLoading(id, true));
      const response = yield call(api.delete, {
        url,
        data: params,
      });
      yield put(setDeleteData(id, response));
    } catch (e) {
      yield put(
        batchActions([
          // logoutHandler(e),
          setDeleteError(id, e),
        ])
      );
    } finally {
      yield put(setDeleteLoading(id, false));
    }
  };

const updateSaga = ({ setUpdateLoading, setUpdateData, setUpdateError }) =>
  function* ({ id, url, params, cacheResponse }) {
    try {
      yield put(setUpdateLoading(id, true));
      const response = yield call(api.put, {
        url,
        data: params,
      });
      if (!cacheResponse) {
        yield put(setUpdateData(id, response || { success: true }));
      }
    } catch (e) {
      // yield put(logoutHandler(e));
      if (!cacheResponse) {
        yield put(setUpdateError(id, e));
      }
    } finally {
      yield put(setUpdateLoading(id, false));
    }
  };

const customTakeLatest = (pattern, saga, ...args) => fork(function* () {
  const lastTask = {};
  while (true) {
    const action = yield take(pattern);
    const id = action?.params?.takeLatestId || action.listId || action.id || action.url;
    if (lastTask[id]) {
      yield cancel(lastTask[id]); // cancel is no-op if the task has already terminated
    }
    lastTask[id] = yield fork(saga, ...args.concat(action));
  }
});

export {
  mergeUpdatedData,
  // logoutHandler,
  createSaga,
  deleteSaga,
  updateSaga,
  customTakeLatest,
};
