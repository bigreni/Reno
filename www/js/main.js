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
    $("#message").text(error);   
}

function reset() {
    $('.js-next-bus-results').html('').hide(); // reset output container's html
    document.getElementById('btnSave').style.visibility = "hidden";
    $("#message").text('');        
}

function getDirections() {
    reset();
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
    reset();
    var dir = $("#MainMobileContent_directionList").val()
    var list = $("#MainMobileContent_stopList");
    $("span").remove();
    $(".dropList").select2();
    $(list).empty();
    $(list).append($("<option disabled/>").val("0").text("- Select Stop -"));
    var stops = routeConfig.route.direction[dir].stop;
    for (var i in stops) {
        var stopTag = stops[i].tag;
        var stopName = stopList[stopTag];
        $(list).append($("<option />").val(stopTag).text(stopName));
    }
    $(list).val(0);
}

function getArrivals()
{
    var route = $("#MainMobileContent_routeList").val()
    var stopCode = $("#MainMobileContent_stopList").val();
    getArrivalTimes(route, stopCode);
}

function getArrivalTimes(route, stopCode) {
    showAd();
    reset();
    var query_url = encodeURI("https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=reno&r=" + route + "&s=" + stopCode);
    var outputContainer = $('.js-next-bus-results');
    $.getJSON(query_url, function(json) {
        var arrivalHtml = '<table id="tblResults" cellpadding="0" cellspacing="0">';
        var preds = {};
        if (json.Error) {
            arrivalHtml += '<tr><td>No Results</td></tr></table>';
            $(outputContainer).html(arrivalHtml).show();
            return;
        }
        // This element only exists when no results
        if (json.predictions.dirTitleBecauseNoPredictions) {
            arrivalHtml += '<tr><td>No Results</td></tr></table>';
            $(outputContainer).html(arrivalHtml).show();
            return;
        }
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
        arrivalHtml += '<tr class="header"><th>' + rname + " " + dir + '</th></tr><tr><td class="spacer" colspan="3"></td></tr>'
        if (preds.constructor === Array) {
            for (var i in preds) {
                arrivalHtml += '<tr class="predictions"><td>' + preds[i].minutes + ' min</td></tr>';
                arrivalHtml += '<tr><td class="spacer" colspan="3"></td></tr>';
            }
        } else {
            arrivalHtml += '<tr class="predictions"><td>' + preds.minutes + ' min</td></tr>';
        }
        arrivalHtml += '</table>';
        document.getElementById('btnSave').style.visibility = "visible";
        $(outputContainer).html(arrivalHtml).show();
    });
}

function saveFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var newFave = $('#MainMobileContent_routeList option:selected').val() + ">" + $("#MainMobileContent_directionList option:selected").val() + ">" + $("#MainMobileContent_stopList option:selected").val() + ":" + $('#MainMobileContent_routeList option:selected').text() + " > " + $("#MainMobileContent_directionList option:selected").text() + " > " + $("#MainMobileContent_stopList option:selected").text();
        if (favStop == null)
        {
            favStop = newFave;
        }   
        else if(favStop.indexOf(newFave) == -1)
        {
            favStop = favStop + "|" + newFave;               
        }
        else
        {
            $("#message").text('Stop is already favorited!!');
            return;
        }
        localStorage.setItem("Favorites", favStop);
        $("#message").text('Stop added to favorites!!');
}

function loadFaves()
{
showAd();
window.location = "Favorites.html";
}

function showAd()
{
document.getElementById("screen").style.display = 'block';     
if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
    AdMob.isInterstitialReady(function(isready){
        if(isready) 
            AdMob.showInterstitial();
    });
}
document.getElementById("screen").style.display = 'none'; 
}