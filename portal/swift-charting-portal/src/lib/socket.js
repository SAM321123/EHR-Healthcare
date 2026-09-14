import { io } from 'socket.io-client';
import { SOCKET_URL } from 'src/api/constants';

const subscriptions = [];
const callbacks = {};

const socket = io.connect(SOCKET_URL, {
  transports: ['polling', 'websocket'],
  // secure: true
});
socket.on('connection', (data) => {
  console.log('-----------------Socket COnnected-----------', data);
});

socket.on("connect", () => {
  console.log("-----------------Socket COnnected 2-----------")
  if (subscriptions && subscriptions.length > 0) {
    subscriptions.forEach(subscription=>{
      socket.emit("join", subscription);
    })
  }
});

socket.on('joined', (uid) => {
  console.log(`Successfully joined room ${uid}`);
});

socket.on('disconnect', () => {
  socket.io.reconnect();
});

socket.on('error', (err) => {
  console.warn("Error in on connect Socket ::: ", err);
});

socket.on('connect_error', (err) => {
  console.warn("Scoket connect Error ::: ", err);
});

const removeOldSubscribed = ({ uid }) => {
  if (subscriptions) {
    subscriptions.some((subscription, index) => {
      const {uid:addedUid} = subscription;
      if (uid === addedUid) {
        if (callbacks) {
          delete callbacks[uid];
        }
        subscriptions.splice(index, 1);
        return true;
      }
      return false;
    });
  }
};

socket.on('data', (event) => {
  const { uid } = event;
  console.log("🚀 ~ socket.on ~ uid:", uid)
  if (callbacks[uid]) callbacks[uid](event);
});

// Function to subscribe to a room
export function subscribe({ uid, _metaData }, callback) {
  removeOldSubscribed({ uid });
  callbacks[uid] = callback;

  subscriptions.push({ uid, _metaData });
  if (socket) socket.emit('join', { uid, _metaData });
}

// Function to unsubscribe from a room
export function unsubscribe({ uid, _metaData }) {
  removeOldSubscribed({ uid });
  if (socket) socket.emit('leave', { uid, _metaData });
}
