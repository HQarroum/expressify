/**
 * ////////////////////////////////////
 * /////// Server application /////////
 * ////////////////////////////////////
 *
 * This app is a sample Expressify server
 * exposing RESTful resources to Expressify
 * clients.
 */

require(['common'], function () {
  require(['expressify'], function (Expressify) {
    var app = new Expressify.Server();

    /**
     * Declaring a logging middleware
     * intercepting requests.
     */
    app.use(function (req, res, next) {
      console.log('[+] Received request for', req.resource);
      next();
    });

    /**
     * Retrieves an object stored in local storage.
     */
    app.get('/echo', function (req, res) {
      res.send(req.serialize());
    }, {
      description: 'Returns the request object as received by the server'
    });

    /**
     * Retrieves an object stored in local storage.
     */
    app.get('/item/:id', function (req, res) {
      var item = window.localStorage.getItem(req.resource);

      if (!item) {
        return res.send(404, { error: 'Item identifier not found' });
      }
      res.send(200, JSON.parse(item));
    }, {
      description: 'Retrieves an object stored in local storage'
    });

    /**
     * Stores a new object in local storage.
     */
    app.post('/item/:id', function (req, res) {
      if (!req.payload.item) {
        return res.send(400, { error: '`item` object was expected' });
      }
      window.localStorage.setItem(req.resource, JSON.stringify(req.payload.item));
      res.send(200);
    }, {
      description: 'Stores a new object in local storage'
    });

    /**
     * Deletes a stored object from local storage.
     */
    app.delete('/item/:id', function (req, res) {
      var item = window.localStorage.getItem(req.resource);

      if (!item) {
        return res.send(404, { error: 'Item identifier not found' });
      }
      window.localStorage.removeItem(req.resource);
      res.send(200);
    }, {
      description: 'Deletes a stored object from local storage'
    });

    /**
     * Resource not found handler.
     */
    app.use(function (req, res) {
      res.send(404);
    });

    /**
     * Listening for local storage changes,
     * and notifying the client of the change
     * using an event.
     */
    window.addEventListener('storage', function (e) {
      app.publish(e.key, {
        event: 'change',
        value: e.newValue
      });
    });

    /**
     * Listening on every domain.
     */
    app.listen();
  });
});