import { ASYNC_CALL } from "./symbols";

export function asyncAction({ type, request, changeVersion = undefined, builder = () => ({}) }) {
  const types = {
    REQUEST: { TYPE: `${type}_REQUEST` },
    SUCCESS: { TYPE: `${type}_SUCCESS` },
    FAILURE: { TYPE: `${type}_FAILURE` }
  };
  return {
    ...types,
    create: (...params) => ({
      [ASYNC_CALL]: {
        types,
        request
      },
      meta: { changeVersion },
      payload: builder(...params)
    })
  }
}

export function syncAction({ type, changeVersion = undefined, builder = () => ({}) }) {
  return {
    TYPE: type,
    create: (...params) => ({
      type,
      meta: { changeVersion },
      payload: builder(...params)
    })
  }
}
