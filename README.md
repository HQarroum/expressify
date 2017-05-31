![Logo](https://s.yimg.com/lq/i/us/pps/yql128.gif)

# query-protocol
[![Build Status](https://travis-ci.org/HQarroum/query-protocol.svg?branch=master)](https://travis-ci.org/HQarroum/query-protocol)

An YQL wrapper used to generate a proxy URL to a given resource.

Current version: **1.0.0**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Install

##### Using NPM

```bash
npm install --save query-protocol
```

##### Using Bower

```bash
bower install --save query-protocol
```

## Description

The web is evolving amazingly fast, and there has been a huge effort to decentralize the way web applications used to be built a few years ago with the avent of more evolved and powerful client-side user agents.
As such, new frameworks, standards, and techniques have been developed, tested and deployed over the years by the community  to make client-side development more efficient and friendly user-experience wise.

The goal being to decouple the client-side from the server-side, diminish the impact (and ultimately the cost) on the servers, and give front-end developers the ability to build more powerful fully-fledged application in the browser.


## Usage



### No conflict

Since this module is distributed in the form of an UMD (Univeral Module Definition), it might be easy to use it using module loaders such as `RequireJS` or `require` in Node while still keeping the module completely encapsulated.

However, in the context of a browser, the `QueryProtocol` object name is exported in the global namespace. To prevent it from conflicting with another component, you can use the `.noConflict` function as follow.

```javascript
var protocol = QueryProtocol.noConflict();
```
