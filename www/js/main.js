    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            notFirstUse();
        }
    }

  var admobid = {};
  if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/8640333155'
    };
  } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/4070532756'
    };
  }

    function initApp() {
        if (!AdMob) { alert('admob plugin not ready'); return; }
        initAd();
        //display interstitial at startup
        loadInterstitial();
    }
    function initAd() {
        var defaultOptions = {
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            bgColor: 'black', // color name, or '#RRGGBB'
            isTesting: false // set to true, to receiving test ad for testing purpose
        };
        AdMob.setOptions(defaultOptions);
        registerAdEvents();
    }
    // optional, in case respond to events or handle error
// optional, in case respond to events or handle error
function registerAdEvents() {
    // new events, with variable to differentiate: adNetwork, adType, adEvent
    document.addEventListener('onAdFailLoad', function (data) {
        document.getElementById('screen').style.display = 'none';     
    });
    document.addEventListener('onAdLoaded', function (data) {
        document.getElementById("screen").style.display = 'none';     
        //AdMob.showInterstitial();
    });
    document.addEventListener('onAdPresent', function (data) { });
    document.addEventListener('onAdLeaveApp', function (data) { 
        document.getElementById("screen").style.display = 'none';     
    });
    document.addEventListener('onAdDismiss', function (data) { 
        document.getElementById('screen').style.display = 'none';     
    });
}

function createSelectedBanner() {
      AdMob.createBanner({adId:admobid.banner});
}

function loadInterstitial() {
    if ((/(android|windows phone)/i.test(navigator.userAgent))) {
        AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: false });
    } else if ((/(ipad|iphone|ipod)/i.test(navigator.userAgent))) {
        AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: false });
    } else
    {
        document.getElementById("screen").style.display = 'none';     
    }
}

   function checkFirstUse()
    {
        //document.getElementById("screen").style.display = 'none';
        //TransitMaster.StopTimes({arrivals: true, headingLabel: "Arrival"});
        $(".dropList").select2();
        initApp();
        askRating();
    }

   function notFirstUse()
    {
        //TransitMaster.StopTimes({arrivals: true, headingLabel: "Arrival"});
        $(".dropList").select2();
        document.getElementById("screen").style.display = 'none';
    }

    function checkPermissions(){
        const idfaPlugin = cordova.plugins.idfa;
    
        idfaPlugin.getInfo()
            .then(info => {
                if (!info.trackingLimited) {
                    return info.idfa || info.aaid;
                } else if (info.trackingPermission === idfaPlugin.TRACKING_PERMISSION_NOT_DETERMINED) {
                    return idfaPlugin.requestPermission().then(result => {
                        if (result === idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
                            return idfaPlugin.getInfo().then(info => {
                                return info.idfa || info.aaid;
                            });
                        }
                    });
                }
            });
    }
    
function askRating()
{
    cordova.plugins.AppRate.setPreferences = {
    reviewType: {
        ios: 'AppStoreReview',
        android: 'InAppBrowser'
        },
    useLanguage:  'en',
    usesUntilPrompt: 10,
    promptAgainForEachNewVersion: true,
    storeAppURL: {
                    ios: '1250715680',
                    android: 'market://details?id=com.reno.free'
                }
    };
 
    AppRate.promptForRating(false);
}

var stopList = {};
var routeConfig = {};

function getStopList(json) {
    var stopArray = json.route.stop;
    var stops = {}
    for (var i in stopArray) {
        var stopName = stopArray[i].title;
        var stopTag = stopArray[i].tag;
        stops[stopTag] = stopName;
    }
    return stops;
}

function displayError(error) {
    reset(true);
    displayResultsBox($("#errorTemplate").render({ error: error }));
}

function displayResultsBox(html) {
    // Unfortunately IE9 leaves	artifacts
    var radius = $("#contentBox").css("border-radius");

    $(html).hide().appendTo("#contentBox").toggle(500, function () {
        $("#contentBox").css("border-radius", radius);
        $(this).animate({ opacity: "1" }, 200);
    });
}

function reset(instantRemove) {
    if (timer != null) {
        window.clearInterval(timer);
        timer = null;
    }

    if ($("#resultBox").length > 0) {
        if (instantRemove)
            $("#resultBox").remove();
        else
            removeResultBox();
    }
}

function removeResultBox() {
    // Unfortunately IE9 leaves	artifacts
    var shadow = $("#contentBox").css("box-shadow");
    var shadowHide = shadow;

    $("#resultBox").animate({ opacity: "0" }, 200, function () {
        $("#contentBox").css("box-shadow", shadowHide);
        $(this).toggle(500, function () {
            $("#contentBox").css("box-shadow", shadow);
            $(this).remove();
        })
    });
}


function getDirections() {
    var url = encodeURI("https://webservices.umoiq.com/service/publicJSONFeed?command=routeConfig&a=reno&r=" + $("#MainMobileContent_routeList").val());
    $.get(url, function(data) {processDirections(data); });
    $("span").remove();
    $(".dropList").select2();
    }

    function processDirections(json)
    {
        var list = $("#MainMobileContent_directionList");
        $(list).empty();
        $(list).append($("<option disabled/>").val("0").text("- Select Direction -"));

        if(json == null || json.route == null || json.route.direction.length == 0)
        {
            displayError("We are facing some technical issues. Please try again later.");
        }
        var directionsTag = json.route.direction;	
        stopList = getStopList(json);
        routeConfig = json;

        for (var i=0; i<directionsTag.length;i++)
        {
            var dirname = directionsTag[i].title;
            var dirnum = i
            $(list).append($("<option />").val(dirnum).text(dirname));
        }
        $(list).val(0);
    }
        
function getStops() {
    var dir = $("#MainMobileContent_directionList").val()
    var list = $("#MainMobileContent_stopList");
    $(list).empty();
    $(list).append($("<option disabled/>").val("0").text("- Select Direction -"));
    var stops = routeConfig.route.direction[dir].stop;
    for (var i in stops) {
        var stopTag = stops[i].tag;
        var stopName = stopList[stopTag];
        $(list).append($("<option />").val(stopTag).text(stopName));
    }
    $("span").remove();
    $(".dropList").select2();
}

function getArrivals()
{
    alert('1');
    var route = $("#MainMobileContent_routeList").val()
    var stopCode = $("#MainMobileContent_stopList").val();
    getArrivalTimes(route, stopCode);
}

function getArrivalTimes(route, stopCode) {
    var query_url = encodeURI("https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=reno&r=" + route + "&s=" + stopCode);
    var outputContainer = $('.js-next-bus-results');
    $.getJSON(query_url, function(json) {
        var arrivalHtml = "";
        var preds = {};
        if (json.Error) {
            arrivalHtml += '<div class="nb-card no-results><span class="nb-card-title">No Results</span>';
            $(outputContainer).html(arrivalHtml).show();
            return;
        }
        // This element only exists when no results
        if (json.predictions.dirTitleBecauseNoPredictions) {
            arrivalHtml += '<div class="nb-card no-results><span class="nb-card-title">No Results</span>';
            $(outputContainer).html(arrivalHtml).show();
            return;
        }
    alert('2');
        var rname = json.predictions.routeTag;
        // Check to see if multiple directions were provided or just one
        if (json.predictions.direction.constructor === Array) {
            var dir = $('#MainMobileContent_directionList').val();
            preds = json.predictions.direction[dir].prediction;
            dir = json.predictions.direction[dir].title;
        } else {
            preds = json.predictions.direction.prediction;
            dir = json.predictions.direction.title;
        }
        arrivalHtml += '<div class="nb-card"><span class="nb-card-title">' + rname + " " + dir + '</span>';
        if (preds.constructor === Array) {
            for (var i in preds) {
                arrivalHtml += '<span class="nb-card-time">' + preds[i].minutes + ' min</span>';
            }
        } else {
            arrivalHtml += '<span class="nb-card-time">' + preds.minutes + ' min</span>';
        }
        alert(arrivalHtml);
        arrivalHtml += '</div>';
        $(outputContainer).html(arrivalHtml).show();
    });
}

function displayError(error) {
    reset(true);
    displayResultsBox($("#errorTemplate").render({ error: error }));
}

function displayResultsBox(html) {
    // Unfortunately IE9 leaves	artifacts
    var radius = $("#contentBox").css("border-radius");

    $(html).hide().appendTo("#contentBox").toggle(500, function () {
        $("#contentBox").css("border-radius", radius);
        $(this).animate({ opacity: "1" }, 200);
    });
}

function reset(instantRemove) {
    if (timer != null) {
        window.clearInterval(timer);
        timer = null;
    }

    if ($("#resultBox").length > 0) {
        if (instantRemove)
            $("#resultBox").remove();
        else
            removeResultBox();
    }
}

function removeResultBox() {
    // Unfortunately IE9 leaves	artifacts
    var shadow = $("#contentBox").css("box-shadow");
    var shadowHide = shadow;

    $("#resultBox").animate({ opacity: "0" }, 200, function () {
        $("#contentBox").css("box-shadow", shadowHide);
        $(this).toggle(500, function () {
            $("#contentBox").css("box-shadow", shadow);
            $(this).remove();
        })
    });
}

// var	TransitMaster =	TransitMaster || {};

// TransitMaster.StopTimes = function (options) {
//     var settings = { arrivals: null, headingLabel: null, includeStops: true };
//     $.extend(settings, options);

//     var timer = null;
//     var initialView = true;
//     initialize();

//     function initialize() {
//         $("#MainMobileContent_routeList").bind("change", function () {
//             var temp = $("#MainContent_routeList").val();

//             if (temp != "") {
//                 $.cookie("route", temp, { expires: 30 });
//                 getDirections();
//             }
//         });

//         $("#MainMobileContent_directionList").bind("change", function () {
//             var temp = $("#MainContent_directionList").val();

//             if (temp != "") {
//                 $.cookie("direction", temp, { expires: 30 });
//                 reset();

//                 if (settings.includeStops)
//                     getStops();
//             }
//         });

//         if (settings.includeStops) {
//             $("#MainMobileContent_stopList").bind("change", function () {
//                 var temp = $("#MainMobileContent_stopList").val();

//                 if (temp != "") {
//                     $.cookie("stop", temp, { expires: 30 });
//                     getArrivalTimes();
//                 }
//             });
//         }

//         getRoutes();
//     }


//     function checkListCookie(key, list) {
//         if (initialView) {
//             var temp = $.cookie(key);
//             if (temp != null && $("#" + list + " option[value=" + temp + "]").length > 0) {
//                 $("#" + list).val(temp).change();
//                 return true;
//             }
//             else
//                 initialView = false;
//         }

//         return false;
//     }

//     function getRoutes() {
//         //$("#MainMobileContent_routeList").text("Loading	routes...");
//         $("#routeWait").removeClass("hidden");

//         $.ajax({
//             type: "POST",
//             url: "http://webwatch.rtcwashoe.com/TMwebwatch/Arrivals.aspx/getRoutes",
//             contentType: "application/json;	charset=utf-8",
//             dataType: "json",
//             success: function (msg) {
//                 if (msg.d == null || msg.d.length == 0) {
//                     $("#MainMobileContent_routeList").text("No routes found");
//                     return;
//                 }

//                 var list = $("#MainMobileContent_routeList");

//                 $(list).get(0).options[$(list).get(0).options.length] = new Option("Select a route...", "0");
//                 $.each(msg.d, function (index, item) {
//                     $(list).append($("<option />").val(item.id).text(item.name));
//                     //$(list).get(0).options[$(list).get(0).options.length] = new Option(item.name, item.id);
//                 });
//                 $(list).val('0');
//                 checkListCookie("route", "MainMobileContent_routeList");
//             },
//             error: function () {
//                 $("#MainMobileContent_routeList").text("Failed to load routes");
//             },
//             complete: function (jqXHR, textStatus) {
//                 $("#routeWait").addClass("hidden");
//             }
//         });
//         $("span").remove();
//         $(".dropList").select2();
//     }

//     function getDirections() {
//         reset();

//         // Clear cookies if	this is	a new selection
//         if (!initialView) {
//             $.cookie("direction", null);
//             $.cookie("stop", null);
//         }

//         if (settings.includeStops) {
//             $("#MainMobileContent_stopList").get(0).options.length = 0;
//         }


//         var list = $("#MainMobileContent_directionList");
//         $(list).empty();
//         $("#MainMobileContent_stopList").empty();
//         $(list).get(0).options.length = 0;
//         //$("#MainMobileContent_directionList").text("Loading	directions...");
//         $("#directionWait").removeClass("hidden");

//         $.ajax({
//             type: "POST",
//             url: "http://webwatch.rtcwashoe.com/TMwebwatch/Arrivals.aspx/getDirections",
//             data: "{routeID: " + $("#MainMobileContent_routeList").val() + "}",
//             contentType: "application/json;	charset=utf-8",
//             dataType: "json",
//             success: function (msg) {
//                 if (msg.d == null || msg.d.length == 0) {
//                     $("#MainMobileContent_directionList").text("No directions found");
//                     return;
//                 }

//                 $(list).get(0).options[$(list).get(0).options.length] = new Option("Select a direction...", "");
//                 $.each(msg.d, function (index, item) {
//                     $(list).append($("<option />").val(item.id).text(item.name));
//                     //$(list).get(0).options[$(list).get(0).options.length] = new Option(item.name, item.id);
//                 });

//                 checkListCookie("direction", "MainMobileContent_directionList");

//                 if (!settings.includeStops)
//                     initialView = false;
//             },
//             error: function () {
//                 $("#MainMobileContent_directionList").text("Failed to load directions");
//             },
//             complete: function (jqXHR, textStatus) {
//                 $("#directionWait").addClass("hidden");
//             }
//         });
//         $("span").remove();
//         $(".dropList").select2();
//     }

//     function getStops() {
//         // Clear cookies if	this is	a new selection
//         if (!initialView)
//             $.cookie("stop", null);

//         var list = $("#MainMobileContent_stopList");

//         $(list).get(0).options.length = 0;
//         //$("#MainMobileContent_stopList").text("Loading stops...");
//         $("#stopWait").removeClass("hidden");

//         $.ajax({
//             type: "POST",
//             url: "http://webwatch.rtcwashoe.com/TMwebwatch/Arrivals.aspx/getStops",
//             data: "{routeID: " + $("#MainMobileContent_routeList").val() + ",	directionID: " + $("#MainMobileContent_directionList").val() + "}",
//             contentType: "application/json;	charset=utf-8",
//             dataType: "json",
//             success: function (msg) {
//                 if (msg.d == null || msg.d.length == 0) {
//                     $("#MainMobileContent_stopList").text("No stops	found");
//                     return;
//                 }
//                 $(list).empty();
//                 $(list).get(0).options[$(list).get(0).options.length] = new Option("Select a stop...", "");

//                 $.each(msg.d, function (index, item) {
//                     $(list).append($("<option />").val(item.id).text(item.name));
//                     //$(list).get(0).options[$(list).get(0).options.length] = new Option(item.name, item.id);
//                 });

//                 checkListCookie("stop", "MainMobileContent_stopList");

//                 initialView = false;
//             },
//             error: function () {
//                 $("#MainMobileContent_stopList").text("Failed to load stops");
//             },
//             complete: function (jqXHR, textStatus) {
//                 $("#stopWait").addClass("hidden");
//             }
//         });
//         $("span").remove();
//         $(".dropList").select2();
//     }

//     function getArrivalTimes(refresh) {
//         if (!refresh) {
//             reset(true);
//             $("#stopWait").removeClass("hidden");
//         }

//         $.ajax({
//             type: "POST",
//             url: "http://webwatch.rtcwashoe.com/TMwebwatch/Arrivals.aspx/getStopTimes",
//             data: "{routeID: " + $("#MainMobileContent_routeList").val() + ",	directionID: " + $("#MainMobileContent_directionList").val() + ",	stopID:	" + $("#MainMobileContent_stopList").val() + ", useArrivalTimes:	" + settings.arrivals + "}",
//             contentType: "application/json;	charset=utf-8",
//             dataType: "json",
//             success: function (msg) {
//                 if (msg.d == null) {
//                     msg.d = { errorMessage: "Sorry, an internal error has occurred" };
//                 }

// 				if (msg.d.errorMessage == null && (msg.d.routeStops == null || msg.d.routeStops[0].stops == null || msg.d.routeStops[0].stops[0].crossings == null || msg.d.routeStops[0].stops[0].crossings.length == 0))
// 					msg.d.errorMessage = "No upcoming stop times found";

// 				if (msg.d.errorMessage != null)
// 				{
// 					displayError(msg.d.errorMessage);
// 					return;
// 				}

// 				msg.d.stops = msg.d.routeStops[0].stops;

// 				var count = msg.d.stops[0].crossings.length;
// 				msg.d.heading = "Next " + (count > 1 ? count : "") + " Vehicle " + settings.headingLabel + (count > 1 ? "s" : "");

//                 var result = $("#stopTemplate").render(msg.d);

//                 if (refresh)
//                     $("#resultBox").html($(result).html());
//                 else
//                     displayResultsBox(result);

//                 if (!refresh)
//                     timer = window.setInterval(function () {
//                         getArrivalTimes(true);
//                     }, 30000);
//             },
//             error: function () {
//                 displayError("Failed to	load stop times");
//             },
//             complete: function (jqXHR, textStatus) {
//                 $("#stopWait").addClass("hidden");
//             }
//         });
//         $("span").remove();
//         $(".dropList").select2();
//     }

//     function displayError(error) {
//         reset(true);
//         displayResultsBox($("#errorTemplate").render({ error: error }));
//     }

//     function displayResultsBox(html) {
//         // Unfortunately IE9 leaves	artifacts
//         var radius = $("#contentBox").css("border-radius");

//         $(html).hide().appendTo("#contentBox").toggle(500, function () {
//             $("#contentBox").css("border-radius", radius);
//             $(this).animate({ opacity: "1" }, 200);
//         });
//     }

//     function reset(instantRemove) {
//         if (timer != null) {
//             window.clearInterval(timer);
//             timer = null;
//         }

//         if ($("#resultBox").length > 0) {
//             if (instantRemove)
//                 $("#resultBox").remove();
//             else
//                 removeResultBox();
//         }
//     }

//     function removeResultBox() {
//         // Unfortunately IE9 leaves	artifacts
//         var shadow = $("#contentBox").css("box-shadow");
//         var shadowHide = shadow;

//         $("#resultBox").animate({ opacity: "0" }, 200, function () {
//             $("#contentBox").css("box-shadow", shadowHide);
//             $(this).toggle(500, function () {
//                 $("#contentBox").css("box-shadow", shadow);
//                 $(this).remove();
//             })
//         });
//     }

//     return {
//         displayError: displayError
//     };
// }