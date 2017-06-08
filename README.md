![Logo](https://s.yimg.com/lq/i/us/pps/yql128.gif)

# static-protocols
[![Build Status](https://travis-ci.org/HQarroum/query-protocol.svg?branch=master)](https://travis-ci.org/HQarroum/query-protocol)

A protocol designed to make serverless web applications comunication efficient and secure.

Current version: **1.0.0**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Install

##### Using NPM

```bash
npm install --save static-protocol
```

##### Using Bower

```bash
bower install --save static-protocol
```

## Features

 - Provides an encapsulation and an enveloppe protocol to exchange data between static web application
 - Allows static applications to expose a RESTful API to one another
 - Built on top the standard `postMessage` API to allow secure communication between cross-domain applications

## Context

The web is evolving amazingly fast, and there have been huge efforts to decentralize the way web applications used to be built a few years ago with the avent of more evolved and powerful client-side user agents.
As such, new [frameworks](https://github.com/enaqx/awesome-react), [standards](https://github.com/w3c/ServiceWorker), and [techniques](https://github.com/hemanth/awesome-pwa) have been developed, tested and deployed over the years by the community to make client-side development more efficient and friendly user-experience wise.

The main pattern during the last decade has been to decouple the client-side from the server-side, diminish the impact (and ultimately the cost) on the servers, and give front-end developers the ability to build more powerful, fully-fledged applications in the browser.

## Description

`static-protocol` is a project aiming at allowing new kind of patterns in front-end development. One of this pattern is the rise of serverless, static applications for the browser.

To achieve this goal we need solid primitives to allow static applications to communicate efficiently, and the idea behind this library is to provide front-end developers with the ability to standardize the way they implement this communication schema using the same resource-centric approach that has been used in back-end development on top of HTTP during the last decade.

## Usage

The library returns a function that you can use to create a new `static-protocol` instance which allows you to interact with both its client and server interfaces. You first need to create a new instance of a static protocol handler.

```js
const app = new QueryProtocol.Application();
```

### Declaring resources

The interface implemented to declare your accessible resources is the same middle-chained interface you'll find in server-side frameworks such as Express or Koa.

```js
/**
 * An implementation of a handler for the resource
 * `/foo`.
 */
app.get('/foo'. (req, res) => {
 // Handle the request.
});
```

You can natively use various methods such as `get`, `post`, `put`, `patch` and `delete` having the same semantics as when you were using them on top of HTTP.

### Consuming requests

The `request` object exposes different properties of the request made by a remote user-agent. This object is passed to your handlers each time a request matching your declared resources is received.

```js
app.get('/foo'. (req, res) => {
 console.log(`
  Query parameters: ${req.query},
  Payload: ${req.payload},
  Headers: ${req.headers},
  Method: ${req.method});
});
```

### Returning a response

When the request has been treated by your handler, you can manipulate the `response` object to return a proper response to the client.

```js
app.get('/foo'. (req, res) => {
 res.reply(200, { foo: 'bar' });
});
```

### Declaring middlewares

Sometimes you just want to declare middlewares along a chain of responsibility to handle an incoming request, as you would do it with `Express`. It is also possible to do so with this library, here are a few use-cases.

```js
app.use((req, res, next) => {
 if (req.method === 'delete') {
  return next(new Error('Deletes are forbiddent'));
 }
 next();
});

/**
 * Handling a request for the `/user` resource.
 */
app.get('/user'. (req, res) => {
 res.reply(200, {
  firstName: 'Halim',
  lastName: 'Qarroum'
 });
});

/**
 * Handling un-treated requests.
 */
app.use((req, res, next) => {
 res.reply(404);
});

/**
 * Handling errors.
 */
app.use((err, req, res, next) => {
 res.reply(500, { error: err.message });
});
```

## FAQ

### Is server-side needed to use `static-protocol` ?

Absolutely not. The idea behind this library is to allow completely serverless applications to interact with one another. This kind of applications could either run on a remote static storage (such as Amazon S3), or even locally on your computer.

### How does that work ?

This library uses the standard `postMessage` browser API to communicate with an application through an iframe. It creates an additional protocol layer on top of `postMessage` to create proper semantic to address remote resources.

## Usage



### No conflict

Since this module is distributed in the form of an UMD (Univeral Module Definition), it might be easy to use it using module loaders such as `RequireJS` or `require` in Node while still keeping the module completely encapsulated.

However, in the context of a browser, the `QueryProtocol` object name is exported in the global namespace. To prevent it from conflicting with another component, you can use the `.noConflict` function as follow.

```javascript
var protocol = QueryProtocol.noConflict();
```
