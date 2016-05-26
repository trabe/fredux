import expect from "expect";
import sinon from "sinon";
import * as middlewares from "../middlewares";
import { ASYNC_CALL } from "../symbols";

describe('middlewares', () => {

  const store = {
    getState() {
      return { version: 1 }
    },

    dispatch() {}
  }

  let next = () => {};
  let apiDispatcher;

  beforeEach(() => {
    apiDispatcher = middlewares.asyncActionMiddleware(store)(next);
    store.dispatch = sinon.spy(() => {});
    next = sinon.mock();
  })

  describe('asyncActionMiddleware', () => {

    context('sync actions', () => {
      it('should pass the action to next', () => {
        const action = { type: 'FRUS' }

        apiDispatcher(action);

        next.once();
        next.withExactArgs(action);
        sinon.assert.notCalled(store.dispatch);
      })
    })

    context('async actions', () => {
      const types = {
        REQUEST: { TYPE: 'FRUS_REQUEST' },
        SUCCESS: { TYPE: 'FRUS_SUCCESS' },
        FAILURE: { TYPE: 'FRUS_FAILURE' }
      }

      it('should dispatch the success action', function(done) {
        const requestPromise = Promise.resolve({key: "value"});

        const action = {
          [ASYNC_CALL]: {
            request: () => requestPromise,
            types
          }
        }

        apiDispatcher(action);

        requestPromise.then(() => {
          sinon.assert.calledTwice(store.dispatch);
          expect(store.dispatch.firstCall.args[0]).toEqual({ type: 'FRUS_REQUEST', meta: { id: 1, version: 1 } });
          expect(store.dispatch.secondCall.args[0]).toEqual({
            type: 'FRUS_SUCCESS',
            payload: { response: { key: "value" } },
            meta: {
              id: 1,
              version: 1
            }
          });
          done();
        }).catch(e => {
          setTimeout(() => {
            throw e;
          });
        });
      })

      it('should dispatch the failure action', function(done) {
        const error = new Error("frus error");
        const requestPromise = Promise.reject(error);

        const action = {
          [ASYNC_CALL]: {
            request: () => requestPromise,
            types
          }
        }

        apiDispatcher(action);

        requestPromise.then(() => {}, () => {
          sinon.assert.calledTwice(store.dispatch);
          expect(store.dispatch.firstCall.args[0]).toEqual({ type: 'FRUS_REQUEST', meta: { id: 1, version: 1 } });
          expect(store.dispatch.secondCall.args[0]).toEqual({
            type: 'FRUS_FAILURE',
            error: true,
            payload: error,
            meta: {
              id: 1,
              version: 1
            }
          });
          done();
        }).catch(e => {
          setTimeout(() => {
            throw e;
          });
        });
      })
    })
  })

  describe('versionMiddleware', () => {
    const versionDispatcher = middlewares.versionMiddleware(store)(next)

    it('should pass the action to next if the version is undefined', () => {
      const action = { type: 'FRUS' }

      versionDispatcher(action);

      next.once()
      next.withExactArgs(action)
    })

    it('should pass the action to next if the version is the current', () => {
      const action = { type: 'FRUS', version: 1 }

      versionDispatcher(action);

      next.once()
      next.withExactArgs(action)
    })

    it('should not pass the action to next if the version is not the current', () => {
      const action = { type: 'FRUS', version: 0 }

      versionDispatcher(action);

      next.never()
    })

  })
})
