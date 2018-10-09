import { PROMISE_CALL, CHANGE_VERSION } from "./symbols";
import { startType, stopType, requestType, successType, failureType } from "./actions";

function deleteApiCall(action) {
  const newAction = { ...action };
  delete newAction[PROMISE_CALL];
  return newAction;
}

const addMeta = key => value => ({ meta, ...action }) => ({ meta: { ...meta, [key]: value }, ...action });
const addMetaFlag = key => addMeta(key)(true);

const setFredux = addMetaFlag("freduxAction");
const setChangeVersion = addMetaFlag("changeVersion");

const setId = addMeta("id");
const setVersion = addMeta("version");

const isPromiseAction = action => Boolean(action[PROMISE_CALL]);
const isDiscardeableAction = ({ meta = {}}, version) => meta.version !== undefined && meta.version !== version;


const processPromiseAction = (store, action, decorate) => {

  const enhance = action => decorate(deleteApiCall(action));
  const promiseCall = action[PROMISE_CALL];

  store.dispatch(enhance({ ...action, type: requestType(action.type) }));

  promiseCall().then(
    response => store.dispatch(enhance({
      ...action,
      type: successType(action.type),
      payload: { ...action.payload, response },
    })),

    error => store.dispatch(enhance({
      ...action,
      type: failureType(action.type),
      error: true,
      payload: { ...action.payload, error },
    }))
  );
}

export const promiseActionMiddleware = store => next => {
  let i = 0;

  function nextId() {
    return ++i;
  }

  return action => {
    if (!isPromiseAction(action)) {
      return next(action);
    }

    const id = nextId();
    const decorate = action => setFredux(setId(id)(action));
    processPromiseAction(store, action, decorate);
  }
};


export const versionedPromiseActionMiddleware = versionSelector => store => next => {

  let i = 0;

  function nextId() {
    return ++i;
  }

  return action => {
    if (isPromiseAction(action)) {
      const version = versionSelector(store.getState());
      const id = nextId();
      const decorate = action => setFredux(setId(id)(setVersion(version)(action)));
      processPromiseAction(store, action, decorate);
      return;
    }

    if (isDiscardeableAction(action, versionSelector(store.getState()))) {
      return;
    }

    return next(action[CHANGE_VERSION] ? setChangeVersion(action) : action);
  }
};
