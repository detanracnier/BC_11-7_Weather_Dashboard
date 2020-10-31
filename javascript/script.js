$(document).ready(function(){
    let API_key = "3f3127e913e04c04db29b543468c9458";

    let citySearchBtn = $("#city_search_button");
    let citySearchInput = $("#city_search_input");
    let displayContainer = $("#display_container");

    //get recent city searches or create empty array
    let recentCitySearches = JSON.parse(localStorage.getItem("recentCitySearches"));
    if (recentCitySearches===null){
        recentCitySearches=[];
        displayContainer.addClass("hidden");
    }

    //city search event
    citySearchBtn.on("click",function(event){
        event.preventDefault();
        let city = citySearchInput.val();
        citySearchInput.val("");
        if(city!=""){
            addRecentSearch(city);
            getWeather(city);
            getForcast(city);
        }
    })


    function getWeather(city){
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q="+city+"&appid="+API_key;
        $.ajax({
            url: queryURL,
            method: "GET"
        })
        .fail(function(){
            removeRecentSearch();
            showCitySearchError();
        })
        .then(function(response) {
            console.log(response);
            displayContainer.removeClass("hidden");
            getUVIndex(response);
            updateWeatherDisplay(response);
        });
    }

    function getUVIndex(cityWeather){
        let lat = cityWeather.coord.lat;
        let lon = cityWeather.coord.lon;
        queryURL = "http://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+API_key;
        $.ajax({
            url: queryURL,
            method: "GET"
        })
        .fail(function(){
            console.log("Failed to get UV index");
        })
        .then(function(response) {
            let value = response.value;
            updateWeatherUV(value);
        });
    }

    function updateWeatherUV(uvIndex){
        console
        let uvEL = $(".city_UV");
        uvEL.text(uvIndex);
        if (uvIndex < 2.1){
            uvEL.css("background-color","green");
        } else if (uvIndex < 5.1){
            uvEL.css("background-color","yellow");
        } else if (uvIndex < 7.1){
            uvEL.css("background-color","orange");
        } else if (uvIndex < 10.1){
            uvEL.css("background-color","red");
        } else if (uvIndex < 11.1){
            uvEL.css("background-color","pink");
        } else {

        }
    }

    function updateWeatherDisplay(cityWeather){
        $(".city_name").text(cityWeather.name);
        $(".current_date").text(moment().format('MMMM Do YYYY'));
        let iconSrc = "./images/icons/" + cityWeather.weather[0].icon + ".png";
        $(".current_weather_icon").attr("src",iconSrc);
        $(".city_temp").text(cityWeather.main.temp);
        $(".city_humidity").text(cityWeather.main.humidity);
        $(".city_wind_speed").text(cityWeather.wind.speed);
    }

    function getForcast(city){
        let queryURL = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q="+city+"&cnt=5&appid="+API_key;
        $.ajax({
            url: queryURL,
            method: "GET"
          })
          .fail(function(){

          })
          .then(function(response) {
              updateForcastDisplay(response);
        });
    }

    function updateForcastDisplay(cityForcast){
        console.log(cityForcast);
        let forcastDisplay = $("#5_day_forcast_container");
        forcastDisplay.empty();
        $.each(cityForcast.list,function(index,forcast){
            let forcastContainerEl = $("<div class=\"card m-auto p-2 bg-primary text-white\">");
            let dateEL = $("<div class=\"font-weight-bold\">");
            let date = forcast.dt_txt.split(" ");
            dateEL.text(date[0]);
            let iconEl = $("<img class=\"icon\">");
            let iconSrc = "./images/icons/"+forcast.weather[0].icon+".png";
            iconEl.attr("src",iconSrc);
            let tempEL = $("<div class=\"mb-2\">");
            tempEL.text("Temp: "+forcast.main.temp+"\u00B0f");
            let humidityEl = $("<div class=\"mb-2\">");
            humidityEl.text("Humidity: "+forcast.main.humidity+"%");
            forcastContainerEl.append(dateEL,iconEl,tempEL,humidityEl);
            forcastDisplay.append(forcastContainerEl);
        });
    }

    function addRecentSearch(city){
        recentCitySearches.unshift(city);
        if(recentCitySearches.length>6){
            recentCitySearches.length=6;
        }
        localStorage.setItem("recentCitySearches",JSON.stringify(recentCitySearches));
        updateRecentSearch();
    }

    function removeRecentSearch(){
        recentCitySearches.shift();
        if(recentCitySearches.length === 0){
            localStorage.removeItem("recentCitySearches");
        } else {
            localStorage.setItem("recentCitySearches",JSON.stringify(recentCitySearches));
        }
        updateRecentSearch();
    }

    function updateRecentSearch(){
        let recentSearchEL = $("#searched_cities_container");
        recentSearchEL.empty();
        $.each(recentCitySearches,function(index,city){
            let cityButton = $("<div class=\"city_button\">");
            cityButton.data("city",city);
            cityButton.text(city);
            cityButton.on("click",function(){
                getWeather($(this).data("city"));
                getForcast($(this).data("city"))
            })
            recentSearchEL.append(cityButton);
        });
    }

    function showCitySearchError(){
        let errorDisplay = $("#search_error_message");
        errorDisplay.removeClass("hidden");
        let errorTimer = setTimeout(function(){
            errorDisplay.addClass("hidden");
            clearTimeout(errorTimer);
        },4000);
    }

    if(recentCitySearches.length != 0){
        updateRecentSearch();
        getWeather(recentCitySearches[0]);
        getForcast(recentCitySearches[0]);
    }
});

