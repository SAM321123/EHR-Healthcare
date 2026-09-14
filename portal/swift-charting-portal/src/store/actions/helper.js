export const SET_CURRENT_TAB = 'SET_CURRENT_TAB';

export const setCurrentTab = (currentTab) => ({
  type: SET_CURRENT_TAB,
  currentTab,
});

export const requestCreate = (type) => (id, url, params, cacheResponse, responseModifier) => ({
  type,
  id,
  url,
  params,
  cacheResponse,
  responseModifier,
});

export const setCreateData = (type) => (id, data) => ({
  type,
  id,
  data,
});

export const setCreateError = (type) => (id, error) => ({
  type,
  id,
  error,
});

export const setCreateLoading = (type) => (id, loading) => ({
  type,
  id,
  loading,
});

export const requestDelete = (type) => (id, url, params) => ({
  type,
  id,
  url,
  params,
});

export const setDeleteData = setCreateData;

export const setDeleteError = setCreateError;

export const setDeleteLoading = setCreateLoading;

export const requestUpdate = requestCreate;

export const setUpdateData = setCreateData;

export const setUpdateError = setCreateError;

export const setUpdateLoading = setCreateLoading;

export const clearData = (type) => (id) => ({
  type,
  id,
});

export const clearReadData = clearData;
