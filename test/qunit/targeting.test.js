/* globals QUnit: false */

'use strict'; //eslint-disable-line

QUnit.module('Targeting', {
	beforeEach: function() {
		this.cookies({});
	}
});

QUnit.test('getFromConfig', function(assert) {
	this.ads.init({});
	let result = this.ads.targeting.get();
	delete result.rf; //Qunit sometimes has referrer
	assert.ok(result.ts, 'timestamp exists');
	assert.ok(result.res, 'responsive breakpoint exists');
	this.ads.targeting.clear();
	this.ads.config('dfp_targeting', '');
	result = this.ads.targeting.get();
	delete result.rf; //Qunit sometimes has referrer
	assert.deepEqual(Object.keys(result).length, 2, 'Empty string dfp_targeting returns only default params');


	this.ads.targeting.clear();
	this.ads.config('dfp_targeting', 'some=test;targeting=params');
	result = this.ads.targeting.get();
	assert.deepEqual(result.some, 'test', 'Simple params are parsed correctly');
	assert.deepEqual(result.targeting, 'params', 'Simple params are parsed correctly');


	this.ads.targeting.clear();
	this.ads.config('dfp_targeting', 'some=test;;targeting=params');
	result = this.ads.targeting.get();
	assert.deepEqual(result.some, 'test', 'Double ; are handled');
	assert.deepEqual(result.targeting, 'params', 'Double ; are handled');

	this.ads.targeting.clear();
	this.ads.config('dfp_targeting', 's@me=test;targeting=par@ms$\'');
	result = this.ads.targeting.get();

	assert.deepEqual(result['s@me'], 'test', 'Special characters in targeting key handled');
	assert.deepEqual(result.targeting, 'par@ms$\'', 'Special characters in targeting value handled');
});

QUnit.test("social referrer", function(assert) {
	let result;
	const referrer = this.stub(this.ads.utils, 'getReferrer');

	referrer.returns('');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, undefined, "No document referrer, socref key returns undefined");

	referrer.returns('http://t.co/cjPOFshzk2');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "twi", "Already logged in, twitter should be mapped from t.co to twi");

	referrer.returns('http://www.facebook.com/l.php?');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "fac", "Already logged in, facebook should be mapped from facebook.com to fac");

	referrer.returns('http://www.linkedin.com/company/4697?trk=NUS-body-company-name');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "lin", "Already logged in, linkedin should be mapped from linkedin.com to lin");

	referrer.returns('http://www.drudgereport.com/');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "dru", "Already logged in, drudge should be mapped from drudgereport.com to dru");

	referrer.returns('http://www.ft.com/cms/s/ed72d2ac-cf4e-11e2-be7b-00144feab7de,Authorised=false.html?_i_location=http%3A%2F%2Fwww.ft.com%2Fcms%2Fs%2F0%2Fed72d2ac-cf4e-11e2-be7b-00144feab7de.html&_i_referer=http%3A%2F%2Ft.co%2F9So3Xw9qFH');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "twi", "via login, twitter should be mapped from t.co to twi");

	referrer.returns('http://www.ft.com/cms/s/cece477a-ceca-11e2-8e16-00144feab7de,Authorised=false.html?_i_location=http%3A%2F%2Fwww.ft.com%2Fcms%2Fs%2F0%2Fcece477a-ceca-11e2-8e16-00144feab7de.html&_i_referer=http%3A%2F%2Fwww.facebook.com%2Fl.php%3Fu%3Dhttp%253A%252F%252Fon.ft.com%252FZSTiyP%26h%3DLAQGl0DzT%26s%3D1');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "fac", "Via login, facebook should be mapped from facebook.com to fac");

	referrer.returns('http://www.ft.com/cms/s/af925250-c765-11e2-9c52-00144feab7de,Authorised=false.html?_i_location=http%3A%2F%2Fwww.ft.com%2Fcms%2Fs%2F0%2Faf925250-c765-11e2-9c52-00144feab7de.html&_i_referer=http%3A%2F%2Fwww.linkedin.com%2Fcompany%2F4697%3Ftrk%3DNUS-body-company-name');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "lin", "Via login, linkedin should be mapped from linkedin.com to lin");

	referrer.returns('http://www.ft.com/cms/s/af925250-c765-11e2-9c52-00144feab7de,Authorised=false.html?_i_location=http%3A%2F%2Fwww.ft.com%2Fcms%2Fs%2F0%2Faf925250-c765-11e2-9c52-00144feab7de.html&_i_referer=http%3A%2F%2Fwww.drudgereport.com%2F');
	this.ads.init({ socialReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.socref, "dru", "Via login, drudge should be mapped from drudgereport.com to dru");
});

QUnit.test('Page referrer', function(assert) {
	let result;
	const referrer = this.stub(this.ads.utils, 'getReferrer');

	referrer.returns('');
	this.ads.init({ pageReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.rf, undefined, "calling rf returns undefined");

	referrer.returns('http://www.example.com/some/page?some=param');
	this.ads.init({ pageReferrer: true });
	result = this.ads.targeting.get();
	assert.equal(result.rf, 'some/page?some=param', "referrer is returned without domain");
});

QUnit.test("search term", function(assert) {
	let result;
	const querystring = this.stub(this.ads.utils, 'getQueryString');

	querystring.returns();
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, undefined, "no query string, kw param should be undefined");

	querystring.returns('q=  this  is  ');
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "this is", "excess space removed");

	querystring.returns('q=  this  is  ');
	this.ads.init();
	result = this.ads.targeting.get('  THIS  IS  ');
	assert.equal(result.kw, "this is", "lowercased");

	querystring.returns("q= ^ this+is 'it' ; ");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "this is it", "DFP restricted characters removed");

	querystring.returns("q= %5E this%2Bis %27it%27 %3B %20 ");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "this is it", "DFP restricted characters removed even if escaped");

	querystring.returns("q=  this.is%2Eit");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "this.is.it", "full-stop escaped as it means something to DFP");

	querystring.returns("q=`!" + '"' + "_%26$%^*_()_+-_={}[]_:@~ '_#<>?,_./|\\");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "`!\"_&$% *_()_ -_={}[]_:@~ _#<>?,_./|\\", "remaining punctuation encoded");

	querystring.returns("q=uk:PSON");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "uk:pson", "uk:PSON from tearsheet");

	querystring.returns("q=PSON.GB%3APLU");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "pson.gb:plu", "PSON.GB:PLU from tearsheet");

	querystring.returns("searchField=power%20my%20world&null=&termId=");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "power my world", "lexicon: searchField in URL");

	querystring.returns("q=rock+my+world");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "rock my world", "alphaville: q in URL");

	querystring.returns("s=uk:PSON");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "uk:pson", "tearsheet uk:PSON: query in URL");

	querystring.returns("s=PSON.GB%3APLU&vsc_appId=ts&ftsite=FTCOM&searchtype=equity");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "pson.gb:plu", "tearsheet PSON.GB:PLU: query in URL");

	querystring.returns("s=PSON%3ALSE&vsc_appId=ts&ftsite=FTCOM&searchtype=equity");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "pson:lse", "tearsheet PSON:LSE: query in URL");

	querystring.returns("view=company&time=123837238384&selectedResultGroup=&query=pearson&country=&issueType=");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "pearson", "search on markets quoted string: query in URL");

	querystring.returns("query=rock%20my%20world");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "rock my world", "search on markets quoted string: query in URL");

	querystring.returns("queryText=rock+my+world&x=0&y=0&aje=true&dse=&dsz=");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "rock my world", "search from articles/video: queryText in URL");

	querystring.returns("queryText=rock+my+world&ftsearchType=type_news");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "rock my world", "search from home page, etc: queryText in URL");

	querystring.returns("queryText=rock+my+world");
	this.ads.init();
	result = this.ads.targeting.get();
	assert.equal(result.kw, "rock my world", "search: queryText in URL");
});

QUnit.test("timestamp", function(assert) {
	// we get the date millis in this way so the test works in different time zones
	const curTime = new Date(Date.UTC(2013, 10, 18, 23, 30, 7));
	const clock = this.date(curTime.valueOf());
	this.ads.init({ timestamp: true });
	let result = this.ads.targeting.get();
	assert.equal(result.ts, '20131118233007', "timestamp value returns correctly");

	// Fast forward one hour
	clock.tick(3600000);
	result = this.ads.targeting.get();
	assert.equal(result.ts, '20131119003007', "fast forward one hour and timestamp value returns correctly");
});

QUnit.test("responsive", function(assert) {

	const breakpoint = this.stub(this.ads.utils.responsive, 'getCurrent');
	breakpoint.returns("small");
	this.ads.init({responsive: [] });
	const result = this.ads.targeting.get();

	assert.equal(result.res, 'small');
});

QUnit.test("Responsive targeting on non-responsive page", function(assert) {

	const breakpoint = this.stub(this.ads.utils.responsive, 'getCurrent');
	breakpoint.returns("small");
	this.ads.init({responsive: false});
	const result = this.ads.targeting.get();

	assert.equal(result.hasOwnProperty('res'), false);
});


QUnit.test('debug starts logging data', function(assert) {
	this.ads.init({dfp_targeting: {data: {allOfThe: 'targeting data'}}});
	const start = this.spy(this.utils.log, "start");

	this.ads.targeting.debug();
	assert.ok(start.called, "`utils.start` was called for 'targeting'");
});
