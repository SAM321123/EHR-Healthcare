import { combineReducers } from 'redux';
import crud from './crud';
import reduxState from './reduxState';
import socket from './socket';

const appReducer = combineReducers({
  crud,
  reduxStoreWithId: reduxState,
  socket,
});

export default (state, action) => {
  if (action.type === '@login/LOGOUT') {
    // eslint-disable-next-line no-param-reassign
    state = {};
  }
  return appReducer(state, action);
};
