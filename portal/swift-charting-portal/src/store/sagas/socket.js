import { put, all, select, actionChannel, take } from 'redux-saga/effects';
import { setReadData } from '../actions/crud';
import { SET_SOCKET_DATA_READ } from '../actions/socket';

export const handleReadSocketEvents = function* ({
  id,
  event,
  responseModifier,
  handleSocketData,
}) {
  let { data } = event || {};
  if (data) {
    const existingData = yield select(
      (state) => state?.crud?.get(id)?.get('read')?.get('data') || []
    );
    data._metaData = existingData._metaData;
    if (handleSocketData) {
      const modifiedData = handleSocketData({
        id,
        event,
        responseModifier,
        existingData,
      });
      yield put(setReadData(id, modifiedData));
    } else {
      if (responseModifier && typeof responseModifier === 'function') {
        data = responseModifier(data);
      }
      yield put(setReadData(id, data));
    }
  }
};

export const watchSocketEvents = function* () {
  const channel = yield actionChannel(SET_SOCKET_DATA_READ);

  while (true) {
    const action = yield take(channel);
    yield handleReadSocketEvents(action);
  }
};

export default function* root() {
  yield all([watchSocketEvents()]);
}
