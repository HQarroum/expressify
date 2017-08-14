# Expressify **Doku.**

Expressify is a project aiming at allowing new kind of patterns in front-end development.
One of this pattern is the rise of serverless, static applications for the browser.

To achieve this goal, we need solid primitives to allow static applications to communicate efficiently between them, and the idea behind this library is to provide front-end developers with the ability to implement this communication schema using the same resource-centric approach that has been used in back-end development on top of HTTP during the last decade.

Expressify implements a protocol designed to make static web applications communications efficient and secure, allowing front-end developers to develop RESTful endpoints in their apps. Think of <a href="https://expressjs.com" target="_blank">Express</a>, in the browser.

## Usage

The library exposes two interfaces, one for a server that can listen for incoming requests, and another one for a client which can send requests to server instances.

## Server interface

The Server interface allows you to listen for incoming requests and to treat them using the same middleware chain you were used to in Express.
To use this interface in your app, you must start by creating a new Expressify server instance.

```js
const app = new Expressify.Server();
```

You can also inject an optional object parameter to the server constructor to customize its behavior.
This is particularly useful for testing purposes, where we want to inject a custom strategy, or mock objects, to assert the behavior of the server is appropriate.
Another use-case would be to use the Expressify interface as-is and plug it into another message passing mechanism.

```js
/**
 * The server constructor can take the following parameters
 * as an input:
 * - `connection`: A an object implementing the `addListener` function
 * and emitting a `message` event whenever a new message is received.
 * This object must also implement a `postMessage` function to allow the
 * sending of a message to a remote application. This interface must comply
 * with the standard implementation made by the W3C on the `postMessage`
 * API semantics. If not provided, the default behavior is to use the global
 * `window` context.
 */
 const app = new Expressify.Server({
   connection: customConnection
 });
```

### Declaring resources

As said, you declare your accessible resources is the same middle-chained interface you'll find in server-side frameworks such as Express or Koa.

You can use one of the helpers available on the <strong>app</strong> object to declare a handler for a resource on a given method, namely: <code>get</code>, <code>post</code>, <code>put</code>, <code>patch</code>, <code>delete</code>, and <code>head</code>.
These methods have the same semantics as when you were using them on top of HTTP.
   
```js
/**
 * An implementation of a handler for the resource
 * `/foo` for the method `get`.
 */
app.get('/foo', (req, res) => {
 // Handle the request.
});
```

### Consuming requests

The `request` object exposes different properties of the request made by a remote user-agent. This object is passed to your handlers each time a request matching your declared resources is received.

```js
app.get('/foo', (req, res) => {
 console.log(`
  Query parameters: ${req.query},
  Payload: ${req.payload},
  Headers: ${req.headers},
  Method: ${req.method}`);
});
```

It is also possible to pass placeholder parameters in the URL, and retrieve the parameters value in the request object.
Placeholders begin with the character `:`

```js
app.get('/user/:id', (req, res) => {
 console.log(`Requested user identifier: ${req.params.id}`);
});
```

### Returning a response

When the request has been treated by your handler, you can use the <code>.send</code> method of the response object to return a proper response to the client.
The first parameter indicates the <strong>return code</strong> of the response having also the same semantics as in HTTP, and the second optional parameter contains the payload that you want to return back.

```js
app.get('/foo', (req, res) => {
 res.send(200, { foo: 'bar' });
});

/**
 * Refusing requests which `domain` origin is different
 * from `http://foo.com`.
 */
app.use((req, res, next) => {
 if (req.domain !== 'http://foo.com') {
  return next(new Error('Forbidden domain'));
 }
 next();
});

/**
 * Handling a request for the `/user` resource.
 */
app.get('/user', (req, res) => {
 res.send(200, {
  firstName: 'Halim',
  lastName: 'Qarroum'
 });
});

/**
 * Handling un-treated requests.
 */
app.use((req, res, next) => {
 res.send(404);
});

/**
 * Middleware intercepting errors.
 * Note the additional `err` parameter in its signature.
 */
app.use((err, req, res, next) => {
 res.send(500, { error: err.message });
});
```

### Declaring middlewares

Sometimes you just want to declare middlewares along a chain of responsibility to handle an incoming request, as you would do it with `Express`. It is also possible to do so with this library, here are a few use-cases.

As you may have noticed, the `.next()` method allows you to execute the next middleware in the chain when the current middleware cannot process the request, or the current middleware is used to transform the request.

### Emit events

It is possible using the server interface to publish a message on a resource. Think of it as a <a href="https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern">publish-subscribe</a> system right into the browser, where topics are in fact RESTful resources.

You can signal events such as changes on a resource, or simply metadata associated with a resource.
Another interesting use-case of this interface would be the use of streams of data that is sent to one or many subscribers.

```js
/**
 * Listens for messages coming from any domain.
 */
app.publish('/user/foo', {
  name: 'event.update',
  payload: updatedUser
});
```

### Listening for incoming requests

When you create a server instance, it will not start accepting requests from third-party clients until you call the `.listen()` method.
This method allows you to accepts requests from every domain when you call it without any parameter, but you can limit the requests you receive by domain by creating an appropriate interceptor function.

```js
/**
 * Listens for messages coming from any domain.
 */
app.listen();
```

If a request is made from a domain that is different from the specified one, the requester will not get any response back and a timeout will be triggered by the Expressify client.
If you want to customize the way you handle incoming requests from cross-domains to sent back an appropriate error, or because you'd like to dynamically allow given domains, you can simply add a middleware at the top of the chain to treat incoming requests.

```js
/**
 * An array of allowed domains.
 */
const array = [
  'https://foo.com',
  'https://bar.com'
];

/**
 * Refusing requests which `domain` origin is not contained
 * in `arrays`.
 */
app.use((req, res, next) => {
 if (array.contains(req.domain)) {
  return next(new Error('Forbidden domain'));
 }
 next();
});
```

## Client interface

The client interface is used to send requests to static applications listening for new connections through an Expressify server.
As for the server, you need to create a first instance of a client scoped to the URL of the static web application you'd like to communicate with.

```js
/**
 * Creates a new client for the given URL.
 */
const client = new Expressify.Client({
  url: 'https://foo.com'
});
```

Behind the scenes, when you will issue a request the client will lazily create an invisible iframe to be able to communicate with the given application in a cross-domain way.

As well as for the server constructor, the client constructor can take additional parameters to customize its behavior.

```js
/**
 * - Like for the server, the client can take an optional
 * `connection` parameter to inject a third-party message
 * passing components, implementing the same interface as
 * the one standardized by the W3C with `postMessage` semantics.
 */
const client = new Expressify.Client({
  url: 'https://foo.com',
  connection: customConnection
});
```

### Issuing requests

You can issue a request by calling helpers implemented on the client object, which are associated with the natively supported methods you can call.
Every method returns a `Promise` which is resolved when a response is returned from the server.
Promises are rejected when a communication failure, such as a timeout, arises.

```js
/**
 * Issues a `GET` request on the `/user/foo` resource. 
 */
client.get('/user/foo').then((res) => {
  console.log(`Response: ${JSON.stringify(res)}`);
}, (err) => {
  console.log(`An error occurred: ${JSON.stringify(err)}`);
});
```

### Requests with payload

Similarly as in HTTP, you can send a payload to a remote server by specifying the appropriate method and payload object in your request.

```js
/**
 * Issues a `PATCH` request on the `/user/foo` resource
 * with a payload.
 */
client.patch('/user/foo', { name: 'bar' }).then(onResponse);
```

### Resource listeners

It is possible to watch for changes on a given resource, and to get back a notification from the server when a resource you have subscribed to has changed.
This gives you the required flexibility for more advanced use-cases in case the remote application generates changes on resources in a spontaneous manner, without you having initiated the change.
As said in the <a href="#emit-events">Emit events</a> section of the server interface, this constitutes the <code>subscribe</code> part of a <a href="https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern">publish-subscribe</a> system.

```js
/**
 * Subscribes to resource `/user/foo` and receives notifications
 * in the associated callback.
 */
client.subscribe('/user/foo', (event) => {
  console.log(`The resource ${event.path} has changed with the event ${event.name}`);
});

/**
 * Similarly, when you want to unsubscribe from a previously
 * registered event, you unsubscribe your listeners using the
 * `unsubscribe` method.
 */
client.unsubscribe('/user/foo', listener);
```

Note that calling the `.subscribe()` method multiple times will cause the associated callback to be added to the list of listeners.
