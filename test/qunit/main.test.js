/* jshint globalstrict: true, browser: true */
/* globals QUnit: false: false */
'use strict';

QUnit.module('Main');

QUnit.test('init All', function(assert) {
	var done = assert.async();
	this.fixturesContainer.add('<div data-o-ads-name="banlb2" data-o-ads-formats="MediumRectangle"></div>');

	document.body.addEventListener('oAds.ready', function(event) {
		assert.equal(event.detail.name, 'banlb2', 'our test slot is requested');
		assert.deepEqual(event.detail.slot.sizes, [[300, 250]], 'with the correct sizes');
		done();
	});
	this.trigger(document.body, 'o.DOMContentLoaded');

});

QUnit.test("debug calls modules' debug functions", function(assert) {
	this.ads.init({
		admantx: {collections: {}},
		gpt: {}
	});

	var admantxDebug = this.spy(this.ads.admantx, 'debug');
	var cbDebug = this.spy(this.ads.cb, 'debug');
	var gptDebug = this.spy(this.ads.gpt, 'debug');
	var kruxDebug = this.spy(this.ads.krux, 'debug');
	var slotsDebug = this.spy(this.ads.slots, 'debug');
	var targetingDebug = this.spy(this.ads.targeting, 'debug');
	var videoDebug = this.spy(this.ads.buildURLForVideo, 'debug');

	this.ads.debug();

	assert.ok(admantxDebug.called);
	assert.ok(cbDebug.called);
	assert.ok(gptDebug.called);
	assert.ok(kruxDebug.called);
	assert.ok(slotsDebug.called);
	assert.ok(targetingDebug.called);
	assert.ok(videoDebug.called);

});

QUnit.test("debug doesn't unset oAds if it was set", function(assert) {
	this.ads.init({
		admantx: {collections: {}},
		gpt: {}
	});

	localStorage.setItem('oAds', true);
	var admantxDebug = this.spy(this.ads.admantx, 'debug');

	this.ads.debug();
	assert.ok(admantxDebug.called);

	assert.ok(localStorage.getItem('oAds'));
});
