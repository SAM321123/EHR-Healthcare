export const SET_SOCKET_DATA_READ = '@socket/SET_SOCKET_DATA_READ';

export const setSocketReadData = (
  id,
  socketRoomId,
  event,
  responseModifier,
  handleSocketData
) => ({
  type: SET_SOCKET_DATA_READ,
  id,
  socketRoomId,
  event,
  responseModifier,
  handleSocketData,
});
