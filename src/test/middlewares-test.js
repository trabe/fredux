import expect from "expect";
import sinon from "sinon";
import * as middlewares from "../middlewares";
import { CHANGE_VERSION, PROMISE_CALL, SET_INTERVAL, UNSET_INTERVAL } from "../symbols";

const { calledOnce, calledTwice, calledWith, notCalled } = sinon.assert;

describe("middlewares", () => {

  const store = {
    getState() {
      return { version: 1 }
    },
    dispatch: sinon.spy()
  };

  const next = sinon.spy();
  let apiDispatcher;

  beforeEach(() => {
    apiDispatcher = middlewares.promiseActionMiddleware(store)(next);
    next.reset();
    store.dispatch.reset();
  });

  describe("promiseActionMiddleware", () => {

    context("non promise actions", () => {
      it("should pass the action to next", () => {
        const action = { type: "FRUS" };

        apiDispatcher(action);


        calledOnce(next);
        calledWith(next, action);
        notCalled(store.dispatch);
      });
    });

    context("promise actions", () => {
      it("should dispatch the success action", function(done) {
        const requestPromise = Promise.resolve({key: "value"});

        const action = {
          [PROMISE_CALL]: () => requestPromise,
          type: "FRUS"
        };

        apiDispatcher(action);

        requestPromise.then(() => {
          calledTwice(store.dispatch);
          expect(store.dispatch.firstCall.args[0]).toEqual({ type: "FRUS_REQUEST", meta: { id: 1, version: 1 } });
          expect(store.dispatch.secondCall.args[0]).toEqual({
            type: "FRUS_SUCCESS",
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
      });

      it("should dispatch the failure action", function(done) {
        const error = new Error("frus error");
        const requestPromise = Promise.reject(error);

        const action = {
          [PROMISE_CALL]: () => requestPromise,
          type: "FRUS"
        };

        apiDispatcher(action);

        requestPromise.then(() => {}, () => {
          calledTwice(store.dispatch);
          expect(store.dispatch.firstCall.args[0]).toEqual({ type: "FRUS_REQUEST", meta: { id: 1, version: 1 } });
          expect(store.dispatch.secondCall.args[0]).toEqual({
            type: "FRUS_FAILURE",
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
      });
    });
  });

  describe("versionMiddleware", () => {
    const versionDispatcher = middlewares.versionMiddleware(store)(next);

    it("should pass the action to next if the version is undefined", () => {
      const action = { type: "FRUS" };

      versionDispatcher(action);

      calledOnce(next);
      calledWith(next, action);
    });

    it("should pass the action to next if the version is the current", () => {
      const action = { type: "FRUS", meta: { version: 1 } };

      versionDispatcher(action);

      calledOnce(next);
      calledWith(next, action);
    });

    it("should not pass the action to next if the version is not the current", () => {
      const action = { type: "FRUS", meta: { version: 0 } };

      versionDispatcher(action);

      notCalled(next);
    });

    it("should add the changeVersion flag to meta if the action has a [CHANGE_VERSION] property", () => {
      const action = { [CHANGE_VERSION]: true, type: "FRUS" };

      versionDispatcher(action);

      calledOnce(next);
      calledWith(next, { type: "FRUS", meta: { changeVersion: true }});
    });
  });

  describe("intervalMiddleware", () => {
    let realSetInterval, realClearInterval, intervalDispatcher;

    const setIntervalAction = { type: "FRUS", [SET_INTERVAL]: { id: "my_poll", timeout: 2000 } };
    const unsetIntervalAction = { type: "FRUS", [UNSET_INTERVAL]: "my_poll" };
    const startAction = { type: "FRUS_START", meta: { id: "my_poll", timeout: 2000 } };
    const stopAction = { type: "FRUS_STOP", meta: { id: "my_poll" } };

    before(() => {
      realSetInterval = setInterval;
      realClearInterval = clearInterval;
      setInterval = sinon.spy(() => 1);
      clearInterval = sinon.spy();
    });

    beforeEach(() => {
      intervalDispatcher = middlewares.intervalMiddleware(store)(next);
      setInterval.reset();
      clearInterval.reset();
    });

    after(() => {
      setInterval = realSetInterval;
      clearInterval = realClearInterval;
    });

    it("should pass the action to next if there is no [SET_INTERVAL] or [UNSET_INTERVAL] property", () => {
      const action = { type: "FRUS" };

      intervalDispatcher(action);

      calledOnce(next);
      calledWith(next, action);
    });

    it("should dispatch the start action and set the interval if there is a [SET_INTERVAL] property and a poller for the id does not exist", () => {
      intervalDispatcher(setIntervalAction);

      notCalled(next);
      calledOnce(store.dispatch);
      calledOnce(setInterval);
      calledWith(store.dispatch, startAction);
    });

    it("should not dispatch the start action and set the interval if there is a [SET_INTERVAL] property but a poller for the id already exists", () => {
      intervalDispatcher(setIntervalAction);
      intervalDispatcher(setIntervalAction);

      notCalled(next);
      calledOnce(store.dispatch);
      calledOnce(setInterval);
      calledWith(store.dispatch, startAction);
    });

    it("should dispatch the stop action if there is a [UNSET_INTERVAL] property and a poller for the id exists", () => {
      intervalDispatcher(setIntervalAction);
      intervalDispatcher(unsetIntervalAction);

      notCalled(next);
      calledOnce(clearInterval);
      calledTwice(store.dispatch);
      calledWith(store.dispatch.firstCall, startAction);
      calledWith(store.dispatch.secondCall, stopAction);
    });

    it("should not dispatch the stop action if there is a [UNSET_INTERVAL] property but a poller for the id does not exist", () => {
      intervalDispatcher(unsetIntervalAction);

      notCalled(next);
      notCalled(store.dispatch);
      notCalled(clearInterval);
    });
  });

});
