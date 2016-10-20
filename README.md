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

### Fredux version middleware

Use the fredux version middleware if you want to handle context changes, for example a navigation to another page.

When an action involves a context change, version middleware cancels all pending promise actions which have been dispatched in previous versions.

Add the version middleware after the api middleware to the store

```
import { promiseActionMiddleware, versionMiddleware } from "fredux";

const store = createStore(reducer, applyMiddleware(promiseActionMiddleware, versionMiddleware));
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

The promiseActionMiddleware will:

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
