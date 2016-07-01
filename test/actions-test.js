import expect from "expect";
import * as actions from "../src/actions";

describe("actions", () => {
  context("promise actions", () => {
    it("should build a request type", () => {
      expect(actions.requestType("FRUS")).toEqual("FRUS_REQUEST");
    });

    it("should build a success type", () => {
      expect(actions.successType("FRUS")).toEqual("FRUS_SUCCESS");
    });

    it("should build a failure type", () => {
      expect(actions.failureType("FRUS")).toEqual("FRUS_FAILURE");
    });

    it("should return true if the action type is a request type", () => {
      expect(actions.isRequestType({ type: "FRUS_REQUEST" }, "FRUS")).toBe(true);
    });

    it("should return true if the action type is a success type", () => {
      expect(actions.isSuccessType({ type: "FRUS_SUCCESS" }, "FRUS")).toBe(true);
    });

    it("should return true if the action type is a failure type", () => {
      expect(actions.isFailureType({ type: "FRUS_FAILURE" }, "FRUS")).toBe(true);
    });
  });

  context("interval actions", () => {
    it("should build a start type", () => {
      expect(actions.startType("FRUS")).toEqual("FRUS_START");
    });

    it("should build a stop type", () => {
      expect(actions.stopType("FRUS")).toEqual("FRUS_STOP");
    });

    it("should return true if the action type is a start type", () => {
      expect(actions.isStartType({ type: "FRUS_START" }, "FRUS")).toBe(true);
    });

    it("should return true if the action type is a stop type", () => {
      expect(actions.isStopType({ type: "FRUS_STOP" }, "FRUS")).toBe(true);
    });
  })
});
