/* globals QUnit: false */

'use strict'; //eslint-disable-line

QUnit.module('utils.createCORSRequest');

QUnit.test('We can make a CORS request', function(assert) {

	const server = this.server();
	server.respondWith("GET", "/some/article/comments.json",
		[200, { "Content-Type": "application/json" }, '[{ "id": 12, "comment": "Hey there" }]']);

	const callback = this.spy();
	this.ads.utils.createCORSRequest('/some/article/comments.json', 'GET', callback);
	server.respond();
	assert.ok(callback.withArgs('[{ "id": 12, "comment": "Hey there" }]'), 'We can make an xhr a request');
});
