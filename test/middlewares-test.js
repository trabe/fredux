import expect from "expect";
import sinon from "sinon";
import * as middlewares from "../src/middlewares";
import { CHANGE_VERSION, PROMISE_CALL } from "../src/symbols";

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
        const payload = { key: "value" };
        const response = { responseKey: "response value" };
        const requestPromise = Promise.resolve(response);

        const action = {
          [PROMISE_CALL]: () => requestPromise,
          type: "FRUS",
          payload
        };

        apiDispatcher(action);

        requestPromise.then(() => {
          calledTwice(store.dispatch);
          expect(store.dispatch.firstCall.args[0]).toEqual({ type: "FRUS_REQUEST", meta: { id: 1, version: 1 }, payload });
          expect(store.dispatch.secondCall.args[0]).toEqual({
            type: "FRUS_SUCCESS",
            payload: {
              ...payload,
              response
            },
            meta: {
              freduxAction: true,
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
        const payload = { key: "value" };
        const error = new Error("frus error");
        const requestPromise = Promise.reject(error);

        const action = {
          [PROMISE_CALL]: () => requestPromise,
          type: "FRUS",
          payload
        };

        apiDispatcher(action);

        requestPromise.then(() => {}, () => {
          calledTwice(store.dispatch);
          expect(store.dispatch.firstCall.args[0]).toEqual({ type: "FRUS_REQUEST", meta: { id: 1, version: 1 }, payload });
          expect(store.dispatch.secondCall.args[0]).toEqual({
            type: "FRUS_FAILURE",
            error: true,
            payload: {
              ...payload,
              error
            },
            meta: {
              freduxAction: true,
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
});
