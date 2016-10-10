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

});
