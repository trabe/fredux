import { ASYNC_CALL } from "./symbols";

function deleteApiCall(action) {
  const newAction = {...action}
  delete newAction[ASYNC_CALL];
  return newAction;
}

function getVersion(store) {
  return store.getState().version;
}

export const asyncActionMiddleware = store => next => action => {
  const apiCall = action[ASYNC_CALL];

  if (!apiCall) {
    return next(action);
  }

  const { request, types } = apiCall;
  const version = getVersion(store);

  store.dispatch(deleteApiCall({ ...action, type: types.REQUEST.TYPE, version }));
  request().then(
    response => store.dispatch(deleteApiCall({
      ...action,
      type: types.SUCCESS.TYPE,
      payload: { ...action.payload, ...response },
      version
    })),

    error => store.dispatch(deleteApiCall({
        ...action,
        type: types.FAILURE.TYPE,
        error: true,
        payload: error,
        version
      }))
  );
}

export const versionMiddleware = store => next => action => {
  if (action.version === undefined || action.version === getVersion(store)) {
    next(action);
  }
};
