import isFunction from 'lodash/isFunction';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { setReadData } from '../store/actions/reduxState';

const getData = (data, defaultValue) => {
  const savedData = data?.get('data');
  if (savedData?.isDataTouched) {
    return savedData?.data;
  }
  return defaultValue;
};

export const selector = (state, id, defaultValue) => {
  if (!id) {
    return null;
  }
  if (state.reduxStoreWithId) {
    let parsedData = state.reduxStoreWithId.get(id);
    if (state.reduxStoreWithId.get('currentTab')) {
      parsedData =
        state.reduxStoreWithId.get(state.reduxStoreWithId.get('currentTab')) &&
        state.reduxStoreWithId
          .get(state.reduxStoreWithId.get('currentTab'))
          .get(id) &&
        state.reduxStoreWithId
          .get(state.reduxStoreWithId.get('currentTab'))
          .get(id);
      return getData(parsedData, defaultValue);
    }
    return getData(parsedData, defaultValue);
  }
  return true;
};

export default function useReduxState(id, defaultValue = undefined) {
  const dispatch = useDispatch();
  const data = useSelector((state) => selector(state, id, defaultValue));

  const set = useCallback(
    (newData) => {
      let parsedData = newData;
      if (isFunction(newData)) {
        parsedData = newData(data);
      }
      dispatch(setReadData(id, { data: parsedData, isDataTouched: true }));
    },
    [dispatch, id, data]
  );

  return [data, set];
}
