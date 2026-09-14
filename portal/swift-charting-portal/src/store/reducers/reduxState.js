import { Map } from 'immutable';

import {
  SET_DATA_READ,
  SET_ERROR_READ,
  SET_LOADING_READ,
  CLEAR_DATA,
  CLEAR_DATA_WITH_ID,
} from '../actions/reduxState';

const initialState = Map({});

const actionsMap = {
  [SET_DATA_READ]: (state, { id, data }) => state.setIn([id, 'data'], data),
  [SET_LOADING_READ]: (state, { id, loading }) =>
    state.setIn([id, 'loading'], loading),
  [SET_ERROR_READ]: (state, { id, error }) => state.setIn([id, 'error'], error),
  [CLEAR_DATA]: () => Map({}),
  [CLEAR_DATA_WITH_ID]: (state, { id }) => state.deleteIn([id, 'data']),
};

export default function reduxStoreWithId(state = initialState, action = {}) {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
}
