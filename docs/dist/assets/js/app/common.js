'use strict';requirejs.config({baseUrl:'./',paths:{jquery:'assets/components/jquery/dist/jquery.min',lodash:'assets/components/lodash/dist/lodash.min',bootstrap:'assets/components/bootstrap/dist/js/bootstrap.min',"middleware-chain":'assets/components/middleware-chain/dist/middleware-chain.min',"timed-cache":'assets/components/timed-cache/cache',expressify:'assets/components/expressify-js/expressify.min',Joi:'assets/components/joi-browser/index',prism:'assets/components/prism/prism',"event-emitter":'assets/components/eventemitter2/lib/eventemitter2'},shim:{bootstrap:{deps:['jquery']},prism:{exports:'Prism'}}}),'undefined'==typeof global&&(window.global=window),define(['jquery','prism','bootstrap']);
