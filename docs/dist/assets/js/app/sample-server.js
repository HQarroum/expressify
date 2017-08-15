'use strict';require(['common'],function(){require(['expressify'],function(a){var b=new a.Server;b.use(function(a,b,c){console.log('[+] Received request for',a.resource),c()}),b.get('/echo',function(a,b){b.send(a.serialize())},{description:'Returns the request object as received by the server'}),b.get('/item/:id',function(a,b){var c=window.localStorage.getItem(a.resource);return c?void b.send(200,JSON.parse(c)):b.send(404,{error:'Item identifier not found'})},{description:'Retrieves an object stored in local storage'}),b.post('/item/:id',function(a,b){return a.payload.item?void(window.localStorage.setItem(a.resource,JSON.stringify(a.payload.item)),b.send(200)):b.send(400,{error:'`item` object was expected'})},{description:'Stores a new object in local storage'}),b.delete('/item/:id',function(a,b){var c=window.localStorage.getItem(a.resource);return c?void(window.localStorage.removeItem(a.resource),b.send(200)):b.send(404,{error:'Item identifier not found'})},{description:'Deletes a stored object from local storage'}),b.use(function(a,b){b.send(404)}),window.addEventListener('storage',function(a){b.publish(a.key,{event:'change',value:a.newValue})}),b.listen()})});