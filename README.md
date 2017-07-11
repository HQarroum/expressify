<h1 align="center">
  <br>
  <a href="#"><img src="https://s.yimg.com/lq/i/us/pps/yql128.gif" alt="microcosm" /></a>
  <br><br>
</h1>

<h4 align="center">A protocol designed to make static web applications communications efficient and secure by allowing front-end developers to develop a RESTful communication endpoint in their static web applications.</h4>

<p align="center">
  <a href="https://travis-ci.org/HQarroum/expressify">
    <img src="https://travis-ci.org/HQarroum/query-protocol.svg?branch=master"
         alt="Build Status">
  </a>
</p>
<br>


## Install

##### Using NPM

```bash
npm install --save expressify
```

##### Using Bower

```bash
bower install --save expressify
```

## Features

 - Provides an encapsulation and an enveloppe protocol to exchange data between static web applications
 - Allows static applications to expose RESTful APIs
 - Provides a service discoverability mechanism
 - Built on top the standard `postMessage` API to allow secure communication between cross-domain applications

## Documentation

The documentation and the FAQ for Expressify is available on the [project website](https://hqarroum.github.io/expressify).


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
