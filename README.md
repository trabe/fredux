# Fredux

## Description

[Redux](https://github.com/reactjs/redux) is a very simple framework that helps you build javascript applications. Sometimes this simplicity could cause problems because of:

* The amount of boilerplate that we have to code
* The lack of tools to:
  * Create actions which follows some standard structure
  * Create asynchronous actions
  * Handle pending promise actions when the context of the application changes like in a page navigation.

Fredux is a utility library to make the development process of redux applications faster and easier. Fredux provides some conventions and tools to solve the above-mentioned problems.

## Features

* Support for [FSA](https://github.com/acdlite/flux-standard-action) action definition and creation.
* Support for promise action handling through a middleware.
* Support for state versioning to handle context changes.

## Install

```
npm install fredux
```

### Setting up fredux promise action middleware

Add the promiseActionMiddleware to the store

```
import { promiseActionMiddleware } from "fredux";

const store = createStore(reducer, applyMiddleware(promiseActionMiddleware));
```

### Fredux versioned promise action middleware

Use the fredux versioned promise action  middleware if you want to handle context changes, for example a navigation to another page.

When an action involves a context change, the middleware cancels all pending promise actions which have been dispatched in previous versions.

Be aware that this middleware takes the version selector as the first parameter to allow the version reducer to
be anywhare in the reducer tree.


```
import { versionedPromiseActionMiddleware } from "fredux";

const selector = state => state.version;
const store = createStore(reducer, applyMiddleware(
  versionedPromiseActionMiddleware(selector), versionMiddleware));
```

Combine the reducer

```
import { version } from "fredux";

const reducer = combineReducers({ version, otherStuff });
```

## Usage

### Using the fredux action decorators

#### Promise actions

```
import { PROMISE_CALL } from "fredux";

export const getMessage(id) {
  return {
      [PROMISE_CALL]: () => yourApiCall(id),
      type: "MESSAGE"
  };
}
```

Both middlewares will:

1. Make the request and dispatch a MESSAGE_REQUEST action.
2. If the request succeeds, the promise middleware will dispatch a MESSAGE_SUCCESS action with the response in the payload.
3. If the request fails, the promise middleware will dispatch a MESSAGE_FAILURE with the error as its payload.

## Using fredux with [normalizr](https://github.com/paularmstrong/normalizr)

```
import { PROMISE_CALL } from "fredux";

export const getMessage(id) {

  return {
      [PROMISE_CALL]: () => yourApiCall(id).then(r => normalize(r, schema)),
      type: "MESSAGE"
  };
}
```

### Utils

#### isFreduxAction

Checks if the given action is a fredux action

```
  import { isFreduxAction } from "fredux";

  isFreduxAction(action);
```

# Changelog

## 2.0.1 (9/10/2018)

* Bugfix: versionedPromiseActionMiddleware was not returning the next() result when processing
  normal actions ([PR #5](https://github.com/trabe/fredux/pull/5)).

## 2.0.0 (19/05/2017)

* versionMiddleware has been deprecated. Now you either use the promiseActionMiddleware or
  the versionedPromiseActionMiddleware

## 1.1.0 (20/10/2016)

* Added freduxAction flag to actions which have been dispatched by fredux middleware.
* Added isFreduxAction function that checks if an action is a fredux action based on the freduxAction flag.

## 1.0.0 (10/10/2016)

* Initial release
