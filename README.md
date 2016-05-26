# Fredux

## Description

[Redux](https://github.com/reactjs/redux) is a very simple framework that helps you build javascript applications. Sometimes this simplicity could cause problems because of:

* The amount of boilerplate that we have to code
* The lack of tools to:
  * Create actions which follows some standard structure
  * Create asynchronous actions
  * Handle pending asynchronous actions when the context of the application changes like in a page navigation.

Fredux is a utility library to make the development process of redux applications faster and easier. Fredux provides some conventions and tools to solve the problems mentioned before.

## Features

* Support for [FSA](https://github.com/acdlite/flux-standard-action) action definition and creation.
* Support for asynchronous action handling through a middleware.
* Support for state versioning to handle context changes.

## Install

```
npm install fredux
```

### Setting up fredux async action middleware

Add the asyncActionMiddleware to the store

```
import { asyncActionMiddleware } from "fredux";

const store = createStore(reducer, applyMiddleware(asyncActionMiddleware));
```

### Fredux version middleware

Use the fredux version middleware if you want to handle context changes, for example a navigation to another page.

When an action involves a context change, version middleware cancels all pending async actions which have been dispatched in previous versions.

Add the version middleware after the api middleware to the store

```
import { asyncActionMiddleware, versionMiddleware } from "fredux";

const store = createStore(reducer, applyMiddleware(asyncActionMiddleware, versionMiddleware));
```

Combine the reducer

```
import { version } from "fredux";

const reducer = combineReducers({ version, otherStuff });
```


## Usage

### Using the fredux actions

#### Synchronous actions

```
import { syncAction } from "fredux";

export const MESSAGE = syncAction({
  type: "MESSAGE",
  builder: (x, y) => ({ x, y })
});

MESSAGE.create(3, 4);
```

`builder` is used to create the action payload (it defaults to the identity function)

`MESSAGE.create(3, 4)` returns a flux standard action like this one:


```
{
  type: "MESSAGE",
  payload: {x: 3, y: 4}
}
```


#### Asynchronous actions

```
import { asyncAction } from "fredux";

export const MESSAGE = asyncAction({
  type: "MESSAGE",
  request: get("http://localhost:3031/test"),
  builder: (x, y) => ({ x, y })
});

MESSAGE.create(3, 4);
```

`MESSAGE.create(3, 4)` returns a special action which is handled by the asyncActionMiddleware.

The asyncActionMiddleware will:

1. Make the request and dispatch a MESSAGE_REQUEST action.
2. If the request succeeds, the api middleware will dispatch a MESSAGE_SUCCESS action with the response as its payload.
3. If the request fails, the api middleware will dispatch a MESSAGE_FAILURE with the error as its payload.

# TODO

* Document `contextChangingAction` and version change stuff
