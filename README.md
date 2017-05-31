![Logo](https://s.yimg.com/lq/i/us/pps/yql128.gif)

# query-protocols
[![Build Status](https://travis-ci.org/HQarroum/query-protocol.svg?branch=master)](https://travis-ci.org/HQarroum/query-protocol)

A protocol designed to make serverless web apps comunication efficient and secure.

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

The web is evolving amazingly fast, and there has been huge efforts to decentralize the way web applications used to be built a few years ago with the avent of more evolved and powerful client-side user agents.
As such, new [frameworks](https://github.com/enaqx/awesome-react), [standards](https://github.com/w3c/ServiceWorker), and [techniques](https://github.com/hemanth/awesome-pwa) have been developed, tested and deployed over the years by the community to make client-side development more efficient and friendly user-experience wise.

The goal being to decouple the client-side from the server-side, diminish the impact (and ultimately the cost) on the servers, and give front-end developers the ability to build more powerful fully-fledged applications in the browser.

There have been quite a lot of evolutions in the server-side world as well, micro-services and serverless approaches being one of the most trended ones today.

### The goal of this project

Query protocols is a project aiming at allowing new kind of patterns in front-end development. One of this pattern is the rise of serverless applications for the browser.

The goal is to leverage existing web applications dedicated to offer a *service* as part as your projects. For example, think about the number of apps requiring the use of a login page. Imagine that you could simply install such an app developed by a third-party and plug it into your own application. The key to this approach is the implementation of a similar protocol between both apps in order for them to exchange relevant informations (e.g login tokens in this case).

### Is a server required to do that ?

Absolutely not. The idea behind `query-protocols` is to allow completely serverless applications to interact with one another. This kind of applications could either run on a remote static storage (such as Amazon S3), or even locally on your computer.

### How does that work ?

This library does not invent anything by itself, is uses the communication mechanisms implemented by browsers to make communications between web-pages possible, namely using `GET` and/or `POST` queries.

### What is the scope of this project ?

Query protocols is payload agnostic, meaning that it does not aim at defining the semantics of the data you are going to exchange between serverless web applications. It rather focuses on two main aspects:

 - It defines *how* the data are going to be transmitted (e.g GET/POST parameters), and *where* to send them (using a URI).
 - It defines the encapsulation of this message (signature, encryption, compression and message envelope).
 - It provides a versionned API to exchange data between micro web applications in a retro-compatible manner.
 
## Security challenges

There are different security challenges to address with this new approach that were not problematic using more traditional monolithic applications:

 - If a payload is sent through the query section of the URI, it becomes visible in the history of the browser, through the address bar  and the server logs (even static file storage systems like S3, or Github Pages keep logs). This can be problematic if you transmit sensitive informations between applications.
 - Using 

## Usage



### No conflict

Since this module is distributed in the form of an UMD (Univeral Module Definition), it might be easy to use it using module loaders such as `RequireJS` or `require` in Node while still keeping the module completely encapsulated.

However, in the context of a browser, the `QueryProtocol` object name is exported in the global namespace. To prevent it from conflicting with another component, you can use the `.noConflict` function as follow.

```javascript
var protocol = QueryProtocol.noConflict();
```
