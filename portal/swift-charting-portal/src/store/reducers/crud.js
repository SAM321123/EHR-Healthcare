import { Map } from 'immutable';

import {
  SET_DATA_READ,
  SET_ERROR_READ,
  SET_LOADING_READ,
  SET_DATA_CREATE,
  SET_LOADING_CREATE,
  SET_ERROR_CREATE,
  SET_DATA_UPDATE,
  SET_LOADING_UPDATE,
  SET_ERROR_UPDATE,
  SET_DATA_DELETE,
  SET_LOADING_DELETE,
  SET_ERROR_DELETE,
  CLEAR_DATA,
  CLEAR_READ_DATA,
  SET_FILTER_CREATE,
} from '../actions/crud';

const initialState = Map({});

const actionsMap = {
  [SET_DATA_READ]: (state, { id, data }) => state.setIn([id, 'read', 'data'], data).setIn([id, 'read', 'loading'], false),
  [SET_LOADING_READ]: (state, { id, loading }) => state.setIn([id, 'read', 'loading'], loading),
  [SET_ERROR_READ]: (state, { id, error }) => state.setIn([id, 'read', 'error'], error).setIn([id, 'read', 'loading'], false),

  [SET_DATA_CREATE]: (state, { id, data }) => state.setIn([id, 'create', 'data'], data),
  [SET_LOADING_CREATE]: (state, { id, loading }) => state.setIn([id, 'create', 'loading'], loading),
  [SET_ERROR_CREATE]: (state, { id, error }) => state.setIn([id, 'create', 'error'], error),
  [SET_FILTER_CREATE]: (state, { id, filtersData }) => state.setIn([id, 'readFilter', 'data'], filtersData),

  [SET_DATA_DELETE]: (state, { id, data }) => state.setIn([id, 'delete', 'data'], data),
  [SET_LOADING_DELETE]: (state, { id, loading }) => state.setIn([id, 'delete', 'loading'], loading),
  [SET_ERROR_DELETE]: (state, { id, error }) => state.setIn([id, 'delete', 'error'], error),

  [SET_DATA_UPDATE]: (state, { id, data }) => state.setIn([id, 'update', 'data'], data),
  [SET_LOADING_UPDATE]: (state, { id, loading }) => state.setIn([id, 'update', 'loading'], loading),
  [SET_ERROR_UPDATE]: (state, { id, error }) => state.setIn([id, 'update', 'error'], error),
  [CLEAR_DATA]: (state, { id }) => state.deleteIn([id, 'update']).deleteIn([id, 'create']).deleteIn([id, 'delete']),
  [CLEAR_READ_DATA]: (state, { id }) => state.deleteIn([id, 'read']),
};

export default function crud(state = initialState, action = {}) {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
}
