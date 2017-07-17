<h1 align="center">
  <br>
  <a href="#"><img src="https://github.com/HQarroum/expressify/blob/master/documentation/assets/images/logo.png" alt="expressify" /></a>
  <br><br>
</h1>

<h4 align="center">RESTful client and server implementation for static web applications running in the browser.</h4>

<p align="center">
  <a href="https://travis-ci.org/HQarroum/expressify">
    <img src="https://travis-ci.org/HQarroum/expressify.svg?branch=master"
         alt="Build Status">
  </a>
  <a href="https://badge.fury.io/js/expressify-js">
    <img src="https://badge.fury.io/js/expressify-js.svg" alt="npm version" height="18">
  </a>
  <a href="https://codecov.io/gh/HQarroum/expressify">
    <img src="https://codecov.io/gh/HQarroum/expressify/branch/master/graph/badge.svg" alt="Codecov" />
  </a>
</p>
<br>

Expressify is built upon a protocol designed to make static web applications communications efficient and secure by allowing front-end developers to develop and consume RESTful communication endpoints in their applications.

Current version: **1.0.1**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Install

##### Using NPM

```bash
npm install --save expressify-js
```

##### Using Bower

```bash
bower install --save expressify-js
```

## Features

 - Allows static applications to expose RESTful APIs in the browser.
 - High-level protocol to exchange data between static web applications.
 - Built-in service discoverability mechanism.
 - Resource centric publish-subscribe for message passing. 
 - Built on top the standard [`postMessage`](https://developer.mozilla.org/docs/Web/API/Window/postMessage) API to allow secure communication between cross-domain applications.
 - Provides both a server and a client implementation of this protocol,

## Documentation

The complete [documentation](https://hqarroum.github.io/expressify/documentation.html), as well as the [FAQ](https://hqarroum.github.io/expressify/faq.html) for Expressify are available on the [project website](https://hqarroum.github.io/expressify). Instructions on how to build `Expressify` and running the unit tests are available in the [wiki section](https://github.com/HQarroum/expressify/wiki).
