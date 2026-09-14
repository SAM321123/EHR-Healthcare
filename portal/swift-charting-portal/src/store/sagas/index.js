import { fork, all } from 'redux-saga/effects';
import crud from './crud';
import socket from './socket';

export default function* root() {
  yield all([
    fork(crud),
    fork(socket),
  ]);
}
