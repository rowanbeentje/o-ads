/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */

/*xxxglobal
    xxx$, FT, tests, test, deepEqual, module */

FT.ads.initDFP();

FT.env.asset = "page";
FT.test = {};

function tests() {

    module("dfp_targeting", {
        setup: function () {
        },
        teardown: function () {
        }
    });

    test("test getDFPTargeting FT.env.dfp_targeting undefined", function () {
        FT.env.dfp_targeting = undefined;
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, undefined, 'targetingValue is not undefined');

    });

    test("test getDFPTargeting unencoded to encoded", function () {
        FT.env.dfp_targeting = "peo=françois hollande:Bashar al-Assad;pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=fran%C3%A3%C2%A7ois%20hollande:bashar%20al-assad;pt=ind', 'targetingValue is ok');
    });

    test("test getDFPTargeting unencoded remove special chars !", function () {
        FT.env.dfp_targeting = "peo=Yahoo!, Google!;pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=yahoo%20google;pt=ind', 'remove special chars: does not match');

    });

    test("test getDFPTargeting unencoded remove special chars *", function () {
        FT.env.dfp_targeting = "peo=Yahoo!*, Google!*;pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=yahoo%20google;pt=ind', 'remove special chars: does not match');

    });

    test("test getDFPTargeting unencoded remove special chars ~", function () {
        FT.env.dfp_targeting = "peo=~Yahoo~ ~Google~;pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=yahoo%20google;pt=ind',  'does not match');
    });

    test("test getDFPTargeting unencoded remove special chars ^", function () {
        FT.env.dfp_targeting = "peo=^Yahoo^, ^Google^;pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=yahoo%20google;pt=ind', 'does not match');

    });

    test("test getDFPTargeting unencoded remove special chars < >", function () {
        FT.env.dfp_targeting = "peo=<Yahoo>, <Google>;pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=yahoo%20google;pt=ind', 'does not match');

    });

    test("test getDFPTargeting unencoded remove special chars '", function () {
        FT.env.dfp_targeting = "peo='Yahoo' 'Google';pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=yahoo%20google;pt=ind', 'does not match');

    });

    test("test getDFPTargeting unencoded remove special chars \"", function () {
        FT.env.dfp_targeting = 'peo="Yahoo" "Google";pt=ind';
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=yahoo%20google;pt=ind', 'does not match');

    });

    test("test getDFPTargeting unencoded remove special chars ()", function () {
            FT.env.dfp_targeting = "peo=Andy Murray(Tennis Player) Athlete;pt=ind";
            var targetingValue = FT.ads.getDFPTargeting();
            deepEqual(targetingValue, 'peo=andy%20murraytennis%20player%20athlete;pt=ind', 'does not match');
    });

    test("test getDFPTargeting unencoded remove special chars []", function () {
        FT.env.dfp_targeting = "peo=Andy Murray[Tennis Player] Athlete;pt=ind";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=andy%20murraytennis%20player%20athlete;pt=ind', 'remove special chars []: does not match');
    });

    test("test getDFPTargeting encoded to doubleEndcoded", function () {
        FT.env.dfp_targeting = "peo=fran%C3%A7ois%20hollande:Bashar%20al-Assad";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=fran%25c3%25a7ois%2520hollande:bashar%2520al-assad', 'targetingValue does not match');

    });

    test("test getDFPTargeting encoded to doubleEndcoded remove special chars !", function () {
        FT.env.dfp_targeting = "peo=fran%C3%A7ois%20!hollande:Bashar%20al-Assad";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=fran%25c3%25a7ois%2520hollande:bashar%2520al-assad', 'doubleEndcoded remove special chars ! does not match');

    });

    test("test getDFPTargeting encoded to doubleEndcoded remove special chars () !", function () {
        FT.env.dfp_targeting = "peo=(fran%C3%A7ois%20hollande!:Bashar%20al-Assad)";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=fran%25c3%25a7ois%2520hollande:bashar%2520al-assad', 'doubleEndcoded remove special chars () ! does not match');

    });


    test("test getDFPTargeting encoded to doubleEndcoded remove special chars []", function () {
        FT.env.dfp_targeting = "peo=fran%C3%A7ois%20hollande:[Bashar%20al-Assad]";
        var targetingValue = FT.ads.getDFPTargeting();
        deepEqual(targetingValue, 'peo=fran%25c3%25a7ois%2520hollande:bashar%2520al-assad', 'doubleEndcoded remove special chars [] does not match');

    });

}

$(tests);
