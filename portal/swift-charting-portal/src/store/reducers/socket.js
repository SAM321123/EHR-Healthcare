import { Map } from 'immutable';
import { SET_SOCKET_DATA_READ } from '../actions/socket';

const initialState = Map({});

const actionsMap = {
  [SET_SOCKET_DATA_READ]: (state, {socketRoomId,event }) => state.setIn([socketRoomId, 'read', 'data'], event),

};

export default function socket(state = initialState, action = {}) {
  const fn = actionsMap[action.type];
  return fn ? fn(state, action) : state;
}
