import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { batchDispatchMiddleware } from 'redux-batched-actions';
import rootReducer from './reducers';
import rootSaga from './sagas';

// const persistedReducer = persistReducer(persistConfig, rootReducer);
// make entry of persistedReducer in place of root reducer in store
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

// eslint-disable-next-line import/prefer-default-export
export const store = createStore(
  rootReducer,
  composeEnhancer(
    applyMiddleware(sagaMiddleware, batchDispatchMiddleware),
  ),
);

sagaMiddleware.run(rootSaga);
