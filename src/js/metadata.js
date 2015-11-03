/* jshint forin: false */
/* globals getUUIDFromString */

//todo: jshint complains about the for in loop on line ~102 because it set the myState var before filtering for hasOwnProperty
// I'm not sure what affect moving the myState var will have (it's used above too) so this need to be refactored at some point

'use strict';
var config = require('./config');
var utils = require('./utils');

function getLoginInfo() {
	var loggedIn = false,
	eid = utils.getCookieParam('FT_U', 'EID') || null,
	remember = utils.cookie('FT_Remember');

	//TODO fix the utils hash method to not error when undefined is passed
	// then we can get rid of the test for the split method
	if (!eid && remember && utils.isFunction(remember.split)) {
		remember = remember.split(':');
		eid = !!(remember[0].length) ? remember[0] : eid;
	}

	if (eid || utils.cookie('FTSession')) {
		loggedIn = true;
	}

	return {eid: eid, loggedIn: loggedIn};
}

function getAyscVars(obj) {
	var subsLevelReplaceLookup = {
		'edt': { '22': /^edit$/, '97': /^.*/ },
		'int': { '22': /^Ftemp$/, '97': /^.*/ },
		'cor': { '22': /^[N]*[PL][01][PL]*[1]*[PL][12][A-Za-z][A-Za-z]/, '97': /^c$/ },
		'lv1': { '22': /^[PL]*[0]*[PL]1[A-Za-z][A-Za-z]/, '97': /^[^c]$/ },
		'lv2': { '22': /^[N]*[PL]*[0]*[PL]2[A-Za-z][A-Za-z]/, '97': /^[^c]$/ },
		'reg': { '22': /^[PL]0[A-Za-z][A-Za-z]/, '97': /^[^c]$/ }
	},
	regex_key_names = ['22', '97'],
	leading_zero_key_names = ['19', '21'],
	substr_key_names = ['24=0=3=cn'];

	function fieldSubstr(SubStrKeyNames, obj) {
		var i, value;

		for (i = 0; i < SubStrKeyNames.length; i++) {
			value = utils.isString(obj) ? obj.charAt(i) : obj[i];
			if (value === false) {
				continue;
			}
			else {
				var SubStrItems = SubStrKeyNames[i].split("="),
				ayscField = SubStrItems[0],
				val = obj[ayscField],
				newField;
				if (val !== undefined) {
					newField = SubStrItems[3];
					obj[newField] = val.substring(SubStrItems[1], SubStrItems[2]);
				}
			}

			return obj;
		}
	}

	function detectERights(obj) {
		if (utils.cookie("FT_U")) {
			var erights = utils.cookie("FT_U").split("="),
			keyname = erights[0],
			val = erights[1];
			if ((keyname !== undefined) && (val === undefined)) {
				obj[keyname] = val;
			}
		}

		return obj;
	}

	function stripLeadingZeros(KeysToStrip, obj) {
		var idx, l;
		for (idx = 0, l = KeysToStrip.length; idx < l; idx++) {
			if (obj[KeysToStrip[idx]]) {
				obj[KeysToStrip[idx]] = obj[KeysToStrip[idx]].replace(/^0+/, "");
			}
		}

		return obj;
	}

	function fieldRegex(RegexKeyNames, obj) {
		var prop;
		function innerReplace(keyName, property) {
			var value = obj[keyName];
			if (value === undefined) {
				return;
			} else if ((myState !== "failed") && (value.match(property[keyName]))) {
				myState = "passed";
			} else {
				myState = "failed";
				return;
			}
		}

		for (prop in subsLevelReplaceLookup) {
			var myState = "initial";
			if (subsLevelReplaceLookup.hasOwnProperty(prop)) {
				for (var i = 0; i < RegexKeyNames.length; i++) {
					innerReplace(RegexKeyNames[i], subsLevelReplaceLookup[prop]);
				}

				if (myState === "passed") {
					obj.slv = prop;
				}
			}
		}

		return obj;
	}

	function prepareAdVars(AllVars) {
		//now we filter the AYSC values prior to adding them to the baseAdvert
		//define fields where we need to strip leading zeros - should be in config
		AllVars = stripLeadingZeros(leading_zero_key_names, AllVars);

		//now assign new corporate codes based on certain regex of old code values
		AllVars = fieldRegex(regex_key_names, AllVars);

		//now take a substring of an input value - used for creating new continent codes - put in config?
		AllVars = fieldSubstr(substr_key_names, AllVars);

		//now add any erights value from the FT_U cookie
		AllVars = detectERights(AllVars);
		return AllVars;
	}

	var out = {},
	item, q;
	if (utils.cookie("AYSC")) {
		q = utils.cookie("AYSC").split("_");

		for (var i = 0, j = q.length; i < j; i++) {
			item = q.pop();
			if (!!item) {
				var key, val,
				m = item.match(/^(\d\d)([^_]+)/);

				if (m) {
					key = m[1];
					val = m[2];
					out[key] = val;
				}
			}
		}
	}

	var x = prepareAdVars(out);
	return utils.extend({}, obj, x);
}

module.exports.getPageType = function() {
	var targeting = config('dfp_targeting') || {};
	if (!utils.isPlainObject(targeting)) {
		if (utils.isString(targeting)) {
			targeting = utils.hash(targeting, ';', '=') || {};
		}
	}

	return targeting.pt || 'unknown';
};

module.exports.user = function() {
	var ayscProp, ayscVal,
	asyc = getAyscVars({}),
	result = {},
	valueFilter = /(PVT)|(x+)/i,
	loginInfo = getLoginInfo(),
	ayscProps = {
		homepage_edition: '28',
		corporate_access_id_code: '27',
		phone_area_code: '26',
		continent: '24',
		subscription_level: 'slv',
		active_personal_investor: '20',
		company_size: '19',
		post_code: '12',
		job_position: '07',
		job_responsibility: '06',
		industry: '05',
		state: '04',
		gender: '02',
		DB_company_size: '40',
		DB_industry: '41',
		DB_company_turnover: '42',
		cameo_country_code: '43',
		cameo_local_code: '44',
		DB_country_code: '45',
		cameo_investor_code: '46',
		cameo_property_code: '51'
	};

	for (ayscProp in ayscProps) {
		if (ayscProps.hasOwnProperty(ayscProp)) {
			ayscVal = asyc[ayscProps[ayscProp]];
			if (ayscVal && !(valueFilter.test(ayscVal))) {
				result[ayscProp] = ayscVal;
			}
		}
	}

	result.eid = loginInfo.eid;
	result.loggedIn = loginInfo.loggedIn;
	return result;
};

module.exports.page = function() {
	var gpt = config('gpt') || {};
	var result = {};
	return result;
};

module.exports.getAyscVars = getAyscVars;
module.exports.getLoginInfo = getLoginInfo;
