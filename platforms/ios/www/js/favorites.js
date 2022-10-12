function loadFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    var arrStops = null;
    var arrIds;
    var text = "";
    for (i = 0; i < arrFaves.length; i++) 
    {
        arrStops = arrFaves[i].split(":");
        arrIds = arrStops[0].split(">");
        text = '<li><button onclick=removeFavorite(' + i + '); style="background-color:red; border:none;float:right;">&#x2718;</button><a href="javascript:loadArrivals(' + arrIds[0] + ',' + arrIds[1] +',' + arrIds[2]  +')"; class="langOption"><h4 class="selectLanguage">' + arrStops[1] + '</h4></a></li>';
	    $("#lstFaves").append(text);
    }
}

function removeFavorite(index)
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    if(arrFaves.length > 1)
    {
        arrFaves.splice(index, 1);
        var faves = arrFaves.join("|");
        localStorage.setItem("Favorites", faves);
    }
    else
    {
        localStorage.removeItem("Favorites");
    }
    location.reload();
}

function loadArrivals(route,direction,stopCode)
{
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
        $(outputContainer).html(arrivalHtml).show();
    });
}
