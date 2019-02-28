<h1 align="center">
  <br>
  <a href="#"><img width="160" src="https://github.com/HQarroum/expressify/blob/master/docs/assets/images/logo.png?raw=true" alt="expressify" /></a>
  <br><br>
</h1>

<h4 align="center">RESTful client and server implementations built on top of an agnostic transport layer.</h4>

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
  <a href="https://www.codefactor.io/repository/github/hqarroum/expressify/overview/master">
    <img src="https://www.codefactor.io/repository/github/hqarroum/expressify/badge/master" alt="CodeFactor" />
  </a>
</p>
<br>

Expressify is built upon a transport agnostic layer making it possible to expose and query RESTful interfaces on top of protocols other than HTTP (e.g MQTT, IPC, TCP, etc.).

Current version: **2.0.1**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Install

##### Using NPM

```bash
npm install --save expressify-js
```

## Features

 - Allows applications to expose RESTful interfaces independently of the underlying transport layer.
 - High-level built-in description protocol to exchange data between applications.
 - Built-in service resources discoverability mechanism.
 - Resource centric publish-subscribe system built-in for observing resources.
 - Both a server and a client interface are provided in this implementation.

## Documentation

The complete [documentation](https://hqarroum.github.io/expressify/#/), as well as the [FAQ](https://hqarroum.github.io/expressify/#/faq.html) are at your disposal all the informations you need to integrate Expressify into your applications. Instructions on how to build `Expressify` and running the unit tests are available in the [wiki section](https://github.com/HQarroum/expressify/wiki).
