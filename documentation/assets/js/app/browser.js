/**
 * ////////////////////////////////////
 * /////// Browser application ////////
 * ////////////////////////////////////
 *
 * This app is responsible of providing an interface
 * to browse third party Expressify resources.
 */

require(['common'], function () {
    require(['jquery', 'prism', 'expressify'], function ($, Prism, Expressify) {
      $(function () {

        console.log(Expressify);

        /**
         * DOM elements.
         */
        var output   = $('.request-output');
        var appUrl   = $('#iframe-url');
        var resource = $('#resource-url');
        var method   = $('#method-name');
        var payload  = $('#json-payload');
        var submit   = $('button[type="submit"]');

        /**
         * Cache objects.
         */
        var cache         = {};
        var subscriptions = {};

        /**
         * Displays the given message in the response
         * output.
         */
        var log = function (message) {
          output.append((message ? message : '') + '<br>');
          output[0].scrollTop = output[0].scrollHeight;
        };

        /**
         * Displays the given request in the response
         * output.
         */
        var request = function (o) {
          log(color('> ' + o.method + ' ' + o.resource + '<br>'
            + '> Host: ' + o.url + '<br>'
            + '<br><br><label class="text-black">Request Payload</label><pre><code>' + Prism.highlight(JSON.stringify(getPayload()), Prism.languages.javascript) + '</code></pre><br>', 'orange'));
        };

        /**
         * Displays the given response in the response
         * output.
         */
        var response = function (o) {
          var message = '< ' + o.code +
            '<br>< TransactionId: ' + o.transactionId +
            '<br>';
          Object.keys(o.headers).forEach(function (key) {
            message += '< '+ key + ': ' + o.headers[key] + '<br>';
          });
          message += '<br><label class="text-black">Response Payload</label><pre><code>' + Prism.highlight(JSON.stringify(o.payload), Prism.languages.javascript) + '</code></pre><br>';
          log(color(message, 'terques'));
        };

        /**
         * Displays the given event in the response
         * output.
         */
        var event = function (e) {
          var message = '< Received a new event' +
            '<br>< TransactionId: ' + e.transactionId +
            '<br>< SubscriptionId: ' + e.subscriptionId +
            '<br>';
          message += '<br><label class="text-black">Event Payload</label><pre><code>' + Prism.highlight(JSON.stringify(e.payload), Prism.languages.javascript) + '</code></pre><br>';
          log(color(message, 'blue'));
        };

        /**
         * Displays the given error in the response
         * output.
         */
        var error = function (message) {
          log(color('< ' + message + '<br>', 'red'));
        };

        /**
         * Returns a bold representation of the given
         * text.
         */
        var bold = function (message) {
          return ('<strong>' + message + '</strong>');
        };

        /**
         * Returns a colored representation of the given
         * text.
         */
        var color = function (message, name) {
          return ('<span class="text-' + name + '">' + message + '</span>');
        };

        /**
         * @return a client instance associated with
         * the given `url`.
         * @param {*} url the url to bind our client with.
         */
        var getClient = function (url) {
          return (cache[url] ? cache[url] :
            (cache[url] = new Expressify.Client({
                url: url,
                timeout: 3 * 1000
            }))
          );
        };

        /**
         * Subscribes to the given `resource` and caches
         * the subscription for later usage. When a new event
         * is received, it is sent to the response output.
         * @param {*} client an instance of an Expressify
         * client.
         * @param {*} resource the resource to subscribe to.
         */
        var subscribe = function (client, resource) {
          if (!subscriptions[resource]) {
            client.subscribe(resource, function (e) {
              event(e);
            });
          }
        };

        /**
         * @return the JSON payload associated with
         * the request.
         */
        var getPayload = function () {
          if (!payload.val().length) {
            return ({});
          }
          try {
            return (JSON.parse(payload.val()));
          } catch (e) {
            return ({});
          }
        };

        /**
         * On form submission, we issue the request.
         */
        $('form').submit(function (e) {
          e.preventDefault();
          // Retrieving current request attributes.
          var url = appUrl.val();
          var res = resource.val();
          var met = method.find(':selected').text();
          // Clearing the output.
          output.html('');
          // Logging the request.
          request({ method: met, resource: res, url: url });
          // Retrieving an Expressify client to issue the request.
          var client = getClient(url);
          // Sending the request.
          client[met.toLowerCase()](res, { data: getPayload() }).then(function (o) {
            submit.button('reset');
            // Displaying the received response.
            response(o);
            // Creating a subscription to the resource.
            subscribe(client, res);
          }, function (err) {
            submit.button('reset');
            error(err);
          });
          submit.button('loading');
        });
      });
    });
});