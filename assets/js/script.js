// ==========================================================================================================
// ! Class Definitions
// ==========================================================================================================

// * Forecast class
// class to hold the forecast data, generalised for current weather and 5 day forecast
// used to store the data from the API call
// contained within the City class for typical use case
class Forecast {
  constructor() {
    this.date = ''; // date of the forecast
    this.icon = ''; // icon code for the weather
    this.temperature = 0; // current temperature
    this.min = 0; // forecast minimum temperature
    this.max = 0; // forecast maximum temperature
    this.wind = 0; // current or forecast wind speed
    this.windDegrees = 0; // current or forecast wind direction in degrees
    this.windGust = 0; // current or forecast wind gust speed
    this.humidity = 0; // current or forecast humidity
    this.description = ''; // current or forecast weather description (matches the icon, really...)
    this.feelsLike = 0; // current or forecast 'feels like' temperature
    this.hasData = false; // flag to indicate if the forecast has data
  }
  // copy info to a new forecast object so that a new object is created, rather than a reference
  clone() {
    const newForecast = new Forecast();
    newForecast.date = this.date;
    newForecast.icon = this.icon;
    newForecast.temperature = this.temperature;
    newForecast.min = this.min;
    newForecast.max = this.max;
    newForecast.wind = this.wind;
    newForecast.windDegrees = this.windDegrees;
    newForecast.windGust = this.windGust;
    newForecast.humidity = this.humidity;
    newForecast.description = this.description;
    newForecast.feelsLike = this.feelsLike;
    newForecast.hasData = this.hasData;
    return newForecast;
  }
  // utility function to convert the date object to a pretty string in the required format
  // or return a default string if there is no data
  formattedDate() {
    if (this.hasData) {
      return dayjs(this.date).format('D/MM/YYYY');
    } else {
      return 'Data unavailable';
    }
  }

  // utility function to format the forecast temperature, either with all details if shortFormat is false (used for current weather)
  // or just the min and max if shortFormat is true (used for the 5 day forecast)
  formattedTemperature(shortFormat, isCurrent) {
    if (this.hasData) {
      if (!shortFormat) {
        let tempIntro = 'Temp: ';
        if (isCurrent) tempIntro = 'Current ' + tempIntro;
        return tempIntro +
            this.temperature.toFixed(1) +
            '°C, feels like: ' +
            this.feelsLike.toFixed(1) +
            '°C. Min: ' +
            this.min.toFixed(1) +
            '°C, max: ' +
            this.max.toFixed(1) +
            '°C';
      } else {
        return 'Temp: min: ' +
            this.min.toFixed(1) +
            '°C, max: ' +
            this.max.toFixed(1) +
            '°C';
      }
    } else {
      return 'Temp: unknown';
    }
  }

  // sets an element text to the formatted temperature
  setTemperature(id, shortFormat, isCurrent) {
    $(id).text( this.formattedTemperature(shortFormat, isCurrent));
  }

  // utility function to format the forecast wind
  formattedWind(shortFormat) {
    if (this.hasData) {
      if (shortFormat) {
        return 'Wind: ' +
        formatWindSpeed(this.wind) + ', ' +
            convertWindDegreesToDirection(this.windDegrees) +
            (this.windGust > 0 ? '<br>&nbsp;&nbsp;gusts to ' + formatWindSpeed(this.windGust) : '');
      } else {
        return 'Current Wind: ' +
        formatWindSpeed(this.wind) + ', ' +
            convertWindDegreesToDirection(this.windDegrees) +
            (this.windGust > 0 ? ', with gusts to ' + formatWindSpeed(this.windGust) : '');
      }
    } else {
      return 'Wind: unknown';
    }
  }

  // display the forecast wind into a HTML element
  setWind(id, shortFormat) {
    $(id).text(this.formattedWind(shortFormat));
  }

  // utility function to format the forecast humidity
  formattedHumidity( shortFormat) {
    if (this.hasData) {
      if (shortFormat) {
        return 'Humidity: ' + this.humidity + '%';
      } else {
        return 'Current Humidity: ' + this.humidity + '%';
      }
    } else {
      return 'Humidity: unknown';
    }
  }

  // display the forecast humidity in a HTML element
  setHumidity(id, shortFormat) {
    $(id).text(this.formattedHumidity(shortFormat));
  }

  // return the URL of the weather icon
  getWeatherIconURL() {
    if (this.hasData && this.icon.length > 0) {
      return 'https://openweathermap.org/img/wn/' + this.icon + '@4x.png';
    } else {
      return '';
    }
  }

  // display the weather icon in an img HTML element by setting the attributes
  setWeatherIcon(id) {
    $(id).attr({
      src: this.getWeatherIconURL(),
      alt: this.description,
    });
  }
}


// =================================================================================================
// * City class
// Holds all the data for a city, including the current weather and the 5 day forecast
// and the geographic info and the city list name, and if it is a favourite
class City {
  constructor(cityName, countryCode) {
    this.clearData(cityName, countryCode);
  }

  // wipe the city data
  clearData(cityName = '', countryCode ='') {
    this.cityName = cityName;// the city name (e.g. 'London' in Title Case)
    this.countryCode = countryCode; // the country code (e.g. 'GB' for the UK, iso2Code from the country list)
    this.countryName = ''; // the country name (e.g. 'United Kingdom')
    this.stateName = '';// the state name (e.g. 'England')
    this.latitude = 0; // the latitude of the city
    this.longitude = 0; // the longitude of the city
    this.currentWeather = new Forecast(); // the current weather forecast
    this.fiveDayForecast = [ // the 5 day forecast
      new Forecast(),
      new Forecast(),
      new Forecast(),
      new Forecast(),
      new Forecast(),
    ];
    this.listName = ''; // the name of the city list that this city is in eg search history, world cities, Australian Capitals, New Zealand Cities
    this.hasData = false; // true if the city has data
    this.isFavourite = false; ; // true if this city is a favourite, becomes part of the favourite list
    this.updateCountryName(); // update the country name based on the country code
  }

  // update the country name based on the country code (if it is not already set)
  updateCountryName() {
    if (this.countryCode && !(this.countryName)) {
      const foundCountry = countryList.find((country) => country.iso2Code === this.countryCode);
      if (foundCountry) {
        this.countryName = foundCountry.countryName;
      }
    }
  }

  // copy info to a new city object (don't always want to pass a city by reference)
  clone() {
    this.updateCountryName();
    const newCity = new City(this.cityName, this.countryCode);
    newCity.countryName = this.countryName;
    newCity.stateName = this.stateName;
    newCity.latitude = this.latitude;
    newCity.longitude = this.longitude;
    newCity.currentWeather = this.currentWeather.clone();
    newCity.fiveDayForecast = this.cloneFiveDayForecast();
    newCity.hasData = this.hasData;
    newCity.listName = this.listName;
    newCity.isFavourite = this.isFavourite;
    return newCity;
  }

  // clones the five day forecast array
  cloneFiveDayForecast() {
    const newFiveDayForecast = [];
    for (let i = 0; i < this.fiveDayForecast.length; i++) {
      newFiveDayForecast.push(this.fiveDayForecast[i].clone());
    }
    return newFiveDayForecast;
  }

  // sets the hasData flag for the  five day forecast
  fiveDayForecastHasData(value) {
    for (let i = 0; i < this.fiveDayForecast.length; i++) {
      this.fiveDayForecast[i].hasData = value;
    }
  }

  // save the city as the default city to local storage so it can be retrieved later
  // the default city is the last city that was searched for, and it is used to
  // show an initial city forecast when the app is first loaded
  saveAsDefault() {
    // save the serialized city object to local storage
    localStorage.setItem('defaultCity', JSON.stringify(this.serialize()));
  }

  // load the default city from local storage
  loadAsDefault() {
    // load the default city from local storage
    const serialized = JSON.parse(localStorage.getItem('defaultCity'));
    if (serialized) {
      this.deserialize(serialized);
    } else {
      // clear the current city
      this.clearData();
    }
  }

  // serialize the parts of the city object that we want to be persistent
  // forecast data is not saved as it will be out of date soon enough
  serialize() {
    const serialized = {
      cityName: this.cityName,
      countryCode: this.countryCode,
      countryName: this.countryName,
      stateName: this.stateName,
      latitude: this.latitude,
      longitude: this.longitude,
      isFavourite: this.isFavourite,
      listName: this.listName,
    };
    return serialized;
  }

  // deserialize the parts of the city object that we want to be persistent
  deserialize(serialized) {
    this.clearData();
    this.cityName = serialized.cityName;
    this.countryCode = serialized.countryCode;
    this.countryName = serialized.countryName;
    this.updateCountryName();
    this.stateName = serialized.stateName;
    this.latitude = serialized.latitude;
    this.longitude = serialized.longitude;
    this.isFavourite = serialized.isFavourite;
    this.listName = serialized.listName;
  }

  // hydrate the page with the city data and forecast data
  displayCityAndForecastToPage() {
    // Use jQuery to display the city and current forecast data to the page for practice
    // display basic information about the city
    $('#hero-city-name').html(this.formatCityName());

    // display the current local time
    $('#hero-city-date').text(this.formatCurrentDate());

    // display the current weather icon
    this.currentWeather.setWeatherIcon('#hero-city-icon');
    // weather description
    $('#hero-city-description').text(this.currentWeather.description);

    // temperature
    this.currentWeather.setTemperature('#hero-city-temps', false, true);
    // wind
    this.currentWeather.setWind('#hero-city-wind', false);
    // humidity
    this.currentWeather.setHumidity('#hero-city-humidity', false);

    // now do the five day forecast, but use string literals to build the HTML
    // yeah, much preferred, tbh.
    let forecastHTML = '';
    for (let i = 0; i < this.fiveDayForecast.length; i++) {
      const thisForecast = this.fiveDayForecast[i];
      const hasDataClass = thisForecast.hasData ? '' : 'd-none';
      forecastHTML += `<div class="col">
      <div id="5-day-forecast-day-${i}" class="card">
        <div
          class="card-header bg-success bg-opacity-25 fw-bold fs-6"
          id="5day-Date-${i}"
        >
          ${thisForecast.formattedDate()}
        </div>
        <div class="card-body p-0">
          <div class="forecast-icon px-2 m-2 ${hasDataClass}"> 
            <img
              src="${thisForecast.getWeatherIconURL()}"}
              class="five-day-weather-icon"
              alt="${thisForecast.description}"
              id="five-day-icon-${i}"
            />
          </div>
          <div class="forecast-description fw-bold text-primary px-2 m-2">${thisForecast.description}</div>
          <div class="${hasDataClass} forecast-temp bg-success bg-opacity-25 px-2 py-1">${thisForecast.formattedTemperature(true)}</div>
          <div class="${hasDataClass} forecast-wind bg-success bg-opacity-10 px-2 py-1">${thisForecast.formattedWind(true)}</div>
          <div class="${hasDataClass} forecast-humidity bg-success bg-opacity-25 px-2 py-1">${thisForecast.formattedHumidity(true)}</div>
          </ul>
      </div>
    </div>
  </div>`;
    }
    // hydrate the page with the 5-day forecast data
    $('#hero-city-forecast-panel').html(forecastHTML);
  }

  // this function formats the city name to be displayed on the page, depending on what data is available
  formatCityName() {
    this.updateCountryName();
    let cityName = this.cityName;
    if (this.stateName.length > 0) {
      cityName += ', ' + this.stateName;
    }
    if (this.countryName.length > 0) {
      cityName += ', ' + this.countryName;
    }
    // add the world emoji to the end of the city name
    if (this.latitude && this.longitude) {
    }
    return cityName;
  }

  // this function formats the current date (local time, not time at the city) to be displayed on the page
  formatCurrentDate() {
    return 'Current weather for today, ' + dayjs().format('dddd, D MMMM, YYYY');
  }
}
// ================================= End of Class Definitions ===============================================

// ==========================================================================================================
// ! GLOBALS
// ==========================================================================================================
// array of Country objects, which hold country codes and names - used to convert country code to country name and vice versa
let countryList = [];

// a city object to hold the info about the city that is being searched for, which is then copied to the selectedCity object
// if successfully populated with data so that it can be displayed
var searchCity = new City('', '');

// the currently selected city that has the displayed forecast
var selectedCity = new City('', '');

// hold the list of cities that have been searched for or that are in other special lists
var citiesCombinedList = [];

// ==========================================================================================================
// ! Main Entrance Point to Web Application
// ==========================================================================================================
$(document).ready(async function() {
  // firstly populate the country select list
  // this grabs 2-digit ISO 3166 country codes and country names from the World Bank API
  // this and other API calls are all called with 'await' so that we are sure data is retrieved and saved
  // before attempts are made to use it
  // hydrateCountryList populates an array of city objects, which is used to populate the select list
  // and it enables conversion from country name to country code, which is used when countries are searched for,
  // hence why this is the first thing done. T
  // The API call is redundant after the first run, as local storage is then used for the list
  await hydrateCountryList();
  // get the city list out of local storage, if it exists
  loadCityList();

  // load the last city from local storage or use the default city (Adelaide, AU) if it hasn't yet been set
  //  put it into the selectedCity object
  loadLastCity();

  // display the last/default city, firstly without weather detail just to make the page look a little better during API calls
  selectedCity.displayCityAndForecastToPage();

  // copy the selectedCity object to the searchCity object which is used to get the current weather via APIs
  searchCity = selectedCity.clone();

  // get the current weather for the last seen/default city
  searchCity.hasData = false;
  // this async function will populate the searchCity object with data from the APIs,
  // including getting geographical data (latitude and longitude), if it doesn't exist,
  // the current weather and daily forecast, and then the 5-day forecast
  await getWeatherData();
  if (searchCity.hasData) {
    // copy the searchCity object to the selectedCity object and display the data
    cloneSearchToSelected();
    // add the city to the list of Search History (if it isn't already there)
    selectedCity.listName = 'Search History';
    addSelectedCityToList();
  }

  // add the standard cities to the list (Australia, New Zealand and notable World Cities) if they aren't already there
  addStandardCities(); // saved to local storage after the first run on the browser

  // select Australia as the default country in the country select list
  $('#input-country').val('AU');

  // populate the Search History list and now it is up to the user!
  populateCityList('Search History');
});

// ==========================================================================================================
// ! Convert the search results into displayed results
// ==========================================================================================================
// now that have obtained data from the API, stored it into the the searchCity object,
// copy the data into to the selectedCity object for displaying to the page
// and saving to local storage if it is new
function cloneSearchToSelected() {
  selectedCity = searchCity.clone();
  // save the selected city to local storage
  selectedCity.saveAsDefault();
  // update the hero UI with the current weather data
  selectedCity.displayCityAndForecastToPage();
  // ensure the selected city is saved to the overall city list
  addSelectedCityToList();
}


// ==========================================================================================================
// ! CRUD functions for the city list
// ==========================================================================================================
// Load default city
function loadLastCity() {
  // Get last selected city from local storage, or use a default city if it hasn't been set yet
  selectedCity.loadAsDefault();
  if (!selectedCity.cityName) {
    // if no city was found in local storage, use the default city of Adelaide, Australia
    selectedCity = new City('Adelaide', 'AU');
    selectedCity.countryName = 'Australia';
    selectedCity.stateName = 'South Australia';
    selectedCity.latitude = -34.92;
    selectedCity.longitude = 138.6;
  }
  return;
}

function loadCityList() {
  citiesCombinedList = [];
  // deserialize the city list from local storage
  const cityList = JSON.parse(localStorage.getItem('cityList'));

  if (cityList) {
    // if there is a city list in local storage then add it to the citiesCombinedList array
    // iterate through the cities in the city list
    for (let i = 0; i < cityList.cities.length; i++) {
      const newCity = new City('', '');
      newCity.deserialize(cityList.cities[i].serializedCity);
      citiesCombinedList.push(newCity);
    }
  }
}


function saveCityList() {
  // serialize the city list to local storage
  // sort the list by city name
  citiesCombinedList.sort((a, b) => {
    return a.cityName.localeCompare(b.cityName);
  });
  // serialize the city list
  const serialized = {
    cities: [],
  };

  for (let i = 0; i < citiesCombinedList.length; i++) {
    let saveCity = new City('', '');
    saveCity = citiesCombinedList[i];
    const serializedCity = saveCity.serialize();
    serialized.cities.push({
      serializedCity,
    });
  }
  // save the city list to local storage
  localStorage.setItem('cityList', JSON.stringify(serialized));
}

function addSelectedCityToList() {
  // add the city to the list of Search History
  // there must not be an existing city in the list with the same name, state and country and listName
  // if there is then ignore it
  let found = false;
  for (let i = 0; i < citiesCombinedList.length; i++) {
    if (
      citiesCombinedList[i].cityName === selectedCity.cityName &&
      citiesCombinedList[i].countryCode === selectedCity.countryCode &&
      citiesCombinedList[i].listName === selectedCity.listName
    ) {
      found = true;
      break;
    }
  }
  if (!found) {
    const newCity = selectedCity.clone();
    citiesCombinedList.push(newCity);
    // ensure duplicates of favourite cities are all set correctly
    if (!propagateFavouriteCities()) {
      // save the city list to local storage if it wasn't saved in the propagateFavouriteCities function
      saveCityList();
    };
  }
}

function addCityToList(newCity) {
  // add the city to the list of Search History
  // there must not be an existing city in the list with the same name, country code and listName
  // if there is then ignore it
  let found = false;
  for (let i = 0; i < citiesCombinedList.length; i++) {
    if (
      citiesCombinedList[i].cityName === newCity.cityName &&
      citiesCombinedList[i].countryCode === newCity.countryCode &&
      citiesCombinedList[i].listName === newCity.listName
    ) {
      found = true;
      break;
    }
  }
  if (!found) {
    citiesCombinedList.push(newCity);
    // save the city list to local storage
    saveCityList();
  }
}

function removeCityFromList(cityName, countryCode, listName) {
  // remove the city from the list of cities
  // there must be an existing city in the list with the same name, countryCode and listName
  // if there is then remove it
  for (let i = 0; i < citiesCombinedList.length; i++) {
    if (
      citiesCombinedList[i].cityName === cityName &&
      citiesCombinedList[i].countryCode === countryCode &&
      citiesCombinedList[i].listName === listName
    ) {
      citiesCombinedList.splice(i, 1);
      // save the city list to local storage
      saveCityList();
      return true;
    }
  }
  return false;
}


// ===================================================================================================
// add default lists of Australian Capitals, New Zealand cities, World Cities to the city select list
function addStandardCities() {
  // create an array of objects containing the city name, country code and list name
  const citiesData = [
    {cityName: 'Adelaide', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Brisbane', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Canberra', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Darwin', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Hobart', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Melbourne', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Perth', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Sydney', countryCode: 'AU', listName: 'Australian Capitals'},
    {cityName: 'Auckland', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Christchurch', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Dunedin', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Hamilton', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Napier', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Nelson', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Palmerston North', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Queenstown', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Rotorua', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Tauranga', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Wellington', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Whangarei', countryCode: 'NZ', listName: 'New Zealand Cities'},
    {cityName: 'Amsterdam', countryCode: 'NL', listName: 'World Cities'},
    {cityName: 'Bangkok', countryCode: 'TH', listName: 'World Cities'},
    {cityName: 'Berlin', countryCode: 'DE', listName: 'World Cities'},
    {cityName: 'Dubai', countryCode: 'AE', listName: 'World Cities'},
    {cityName: 'Hong Kong', countryCode: 'CN', listName: 'World Cities'},
    {cityName: 'London', countryCode: 'GB', listName: 'World Cities'},
    {cityName: 'Los Angeles', countryCode: 'US', listName: 'World Cities'},
    {cityName: 'New York', countryCode: 'US', listName: 'World Cities'},
    {cityName: 'Paris', countryCode: 'FR', listName: 'World Cities'},
    {cityName: 'Rio de Janeiro', countryCode: 'BR', listName: 'World Cities'},
    {cityName: 'Rome', countryCode: 'IT', listName: 'World Cities'},
    {cityName: 'Shanghai', countryCode: 'CN', listName: 'World Cities'},
    {cityName: 'Singapore', countryCode: 'SG', listName: 'World Cities'},
    {cityName: 'Sydney', countryCode: 'AU', listName: 'World Cities'},
    {cityName: 'Tokyo', countryCode: 'JP', listName: 'World Cities'},
  ];

  citiesData.forEach((cityData) => {
    const newCity = new City(cityData.cityName, cityData.countryCode);
    newCity.listName = cityData.listName;
    // add the city to the appropriate list, avoid duplicates
    addCityToList(newCity);
  });

  // propagate the favourite cities to the city select list elements as there
  // can be duplicates due to the different lists
  propagateFavouriteCities();
}

// ensure duplicate cities (in different list categories) have the same favourite status
// return true if any changes were made
function propagateFavouriteCities() {
  const favouriteCities = citiesCombinedList.filter((city) => city.isFavourite);
  const nonFavoriteCities = citiesCombinedList.filter((city) => !city.isFavourite);
  let foundOne = false;
  favouriteCities.forEach((city) => {
    nonFavoriteCities.forEach((nonFavouriteCity) => {
      if (city.cityName === nonFavouriteCity.cityName && city.countryCode === nonFavouriteCity.countryCode) {
        nonFavouriteCity.isFavourite = true;
        foundOne = true;
      }
    });
  });

  // if one was updated, then save the list to local storage
  if (foundOne) {
    saveCityList();
    return true;
  };
  return false;
}

// copy the weather info to all instances of the selected city
function propagateWeatherInfo() {
  const favouriteCities = citiesCombinedList.filter((city) => searchCity.cityName === city.cityName && searchCity.countryCode === city.countryCode);
  favouriteCities.forEach((city) => {
    city.currentWeather = searchCity.currentWeather.clone();
    city.fiveDayForecast = searchCity.cloneFiveDayForecast();
    city.hasData = searchCity.hasData;
  });
}

// set or reset the favourite status of the selected city, and as the city may appear on multiple lists, update all instances
function toggleFavouriteStatus(isFavourite, cityName, countryCode) {
  const matchingCities = citiesCombinedList.filter((city) => city.cityName === cityName && city.countryCode === countryCode);
  if (matchingCities.length > 0 ) {
    matchingCities.forEach((city) => {
      city.isFavourite = isFavourite;
    });
    saveCityList();
  }
}

// sort the country list by country name
function sortCountryList() {
  countryList.sort((a, b) => {
    return a.countryName.localeCompare(b.countryName);
  });
}

// =================================================================================================
// ! API Calls and API information
// =================================================================================================
// Current Weather Data
// API Documentation: https://openweathermap.org/current
// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
// NB: it seems to want the lat and lon to be in decimal degrees to two decimal places only

// 5 Day / 3 Hour Forecast
// API Documentation: https://openweathermap.org/forecast5
// https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}

// Geocoding API
// API Documentation https://openweathermap.org/api/geocoding-api
// https://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// {city name} is obviously the city name
// {state code} is the US state code only
// {country code} is the ISO 3166-2 country code
// {limit} is the number of results to return (up to 5 can be returned)
// World Bank Country list https://api.worldbank.org/v2/country?format=json&per_page=50&page=2


// ========================= World Bank API ==================================================
// https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures
// NB this page may not display correctly in Google Chrome

// get all of the country codes from the world bank so that the user can select a country and
// we can use the country code for the weather api
// this is a bit tricky because the world bank api only returns 50 countries per page
// so we have to make multiple calls to the api to get all of the countries
// and use async and await to make sure the data is captured before we continue

async function hydrateCountryList() {
  // check local storage for the countries first
  countryList = JSON.parse(localStorage.getItem('countries'));
  const baseURL = 'https://api.worldbank.org/v2/country';
  if (!countryList || countryList.length < 100) {
    // reset the global array that holds the countries
    countryList = [];
    // not in local storage, so get them from the world bank api
    // set up the initial search parameters
    const searchParameters = {format: 'json', per_page: 50, page: 1};

    // retrieving the countries from the world bank api and don't continue until it's done
    // this is a recursive routine that will keep calling itself until all of the countries
    // have been retrieved
    await retrieveCountries(baseURL, searchParameters);
    // save the countries to local storage ready for next time
    sortCountryList();
    localStorage.setItem('countries', JSON.stringify(countryList));
  }
  // now fill the country select list (input-country)
  const countrySelect = document.getElementById('input-country');
  // clear the select list
  countrySelect.innerHTML = '';
  // add Australia and New Zealand and US and UK to top of country list
  addCountryToSelect(countrySelect, 'AU', 'Australia');
  addCountryToSelect(countrySelect, 'NZ', 'New Zealand');
  addCountryToSelect(countrySelect, 'US', 'United States');
  addCountryToSelect(countrySelect, 'GB', 'United Kingdom');

  // add the countries to the county select list
  for (let i = 0; i < countryList.length; i++) {
    // get the key-value pair from the countryList array
    const kvp = countryList[i];
    // get the key (iso2Code) and the value (name) from the key-value pair
    const key = kvp.iso2Code;
    // ignore AU and NZ etc because we've already added them
    if (
      !(
        key === '' ||
        key === 'AU' ||
        key === 'NZ' ||
        key === 'US' ||
        key === 'GB'
      )
    ) {
      // create an option element for the select list
      addCountryToSelect(countrySelect, key, kvp.countryName);
    }
  }
}

function addCountryToSelect(listElement, countryCode, countryName) {
  // add the country to the country dropdown
  selectOption = document.createElement('option');
  selectOption.value = countryCode;
  selectOption.innerHTML = countryName;
  listElement.appendChild(selectOption);
}

// this function retrieves the countries from the world bank api, one page at a time
// it uses recursion to get all of the pages of countries
// and awaits the response from the api before continuing
async function retrieveCountries(baseURL, searchParameters) {
  // create a URLSearchParams object from the search parameters
  const formattedSearchParameters = new URLSearchParams(searchParameters);
  // create the URL to retrieve the countries one page at a time
  const url = `${baseURL}?${formattedSearchParameters}`;
  // wait for the response from the api
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching countries');
    }
    // wait for the response to be converted to json
    const data = await response.json();
    // now add the countries to the global array
    for (let i = 0; i < data[1].length; i++) {
    // get a key-value pair of iso2Code and name from the country object
    // but only if it is a country not a region...
      if (data[1][i].region.id !== 'NA') {
        const countryObject ={
          iso2Code: data[1][i].iso2Code,
          countryName: data[1][i].name,
        };
        // add the key-value pair to the global countryList array
        countryList.push(countryObject);
      }
    }
    // check if there are more pages of countries to retrieve
    if (data[0].pages > searchParameters.page) {
    // increment the page number and retrieve the next page recursively and await the response
      searchParameters.page++;
      await retrieveCountries(baseURL, searchParameters);
    }
  } catch (error) {
    alertModal('API Error in retrieveCountries', error.message);
    return false;
  }
}

// here is where the magic happens and the weather data is retrieved
// using the searchCity object to hold the city and country info
// calls the geo api to get the lat and long for the city if necessary
// then calls the weather api to get the current weather and the 5 day forecast
// using the open weather api
async function getWeatherData() {
  // see if we already have latitude and longitude for the city
  let success = true;
  if (searchCity.latitude == 0 && searchCity.longitude == 0) {
    // if not, get the lat and long
    success = await getLatAndLong();
    if (!success) {
      // no coordinates returned
      alertModal( 'Problem retrieving geographic info', 'Could not retrieve the city coordinates - it might not exist, or it isn\'t in the OpenWeatherMap geographic database.');
      return false;
    }
  }

  // have coordinates, so get the weather data
  success = await getCurrentWeather();
  if (success) {
    success = await getFiveDayForecast();
    if (!success) {
      alertModal('Problem retrieving weather info', 'Could not retrieve five day forecast weather information');
    }
  } else {
    alertModal('Problem retrieving weather info', 'Could not retrieve weather information.');
  }

  // copy weather info over to the selected city in the list so can display it from different lists
  // and populate the badges in the different lists this city is in
  propagateWeatherInfo();
  return success;
}

// convert the city name and country code to latitude and longitude
// using the OpenWeatherMap geo api
async function getLatAndLong() {
  const apiKey = cleverlyObfuscatedSecret();
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity.cityName},${searchCity.countryCode}&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching the latitude and longitude of the city');
    }
    // wait for the response to be converted to json
    const data = await response.json();
    if (data) {
      // choose the first city returned: could be up to 5
      // a future enhancement would be to give the user a choice
      searchCity.latitude = data[0].lat;
      searchCity.longitude = data[0].lon;
      if (data[0].hasOwnProperty('state')) {
        searchCity.stateName = data[0].state;
      } else {
        searchCity.stateName = '';
      }
      return (searchCity.latitude && searchCity.longitude);
    } else {
      searchCity.latitude = 0;
      searchCity.longitude = 0;
      searchCity.stateName = '';
      return false;
    }
  } catch (error) {
    alertModal('API Error in getLatAndLong', error.message);
    return false;
  }
}

// this function retrieves the current weather for the city searchCity
// using the OpenWeatherMap api
async function getCurrentWeather() {
  const apiKey = cleverlyObfuscatedSecret();
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${searchCity.latitude.toFixed(
      2,
  )}&lon=${searchCity.longitude.toFixed(2)}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      searchCity.hasData = false;
      searchCity.currentWeather.hasData = false;
      searchCity.fiveDayForecastHasData(false);

      throw new Error('Error fetching current weather');
    }
    // wait for the response to be converted to json
    const data = await response.json();
    if (data) {
      // grab the data and put it into the currentCity object
      searchCity.currentWeather.date = dayjs();
      searchCity.currentWeather.temperature = data.main.temp;
      searchCity.currentWeather.feelsLike = data.main.feels_like;
      searchCity.currentWeather.min = data.main.temp_min;
      searchCity.currentWeather.max = data.main.temp_max;
      searchCity.currentWeather.wind = data.wind.speed;
      searchCity.currentWeather.windDegrees = data.wind.deg;
      searchCity.currentWeather.windGust = data.wind.gust;
      searchCity.currentWeather.humidity = data.main.humidity;
      searchCity.currentWeather.icon = data.weather[0].icon;
      searchCity.currentWeather.description = data.weather[0].description;
      searchCity.currentWeather.hasData = true;
      searchCity.hasData = true;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    searchCity.hasData = false;
    alertModal('API Error in getCurrentWeather', error.message);
    return false;
  }
}

// this function retrieves the five day forecast for the searchCity
// using the OpenWeatherMap api
async function getFiveDayForecast() {
  const apiKey = cleverlyObfuscatedSecret();
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${searchCity.latitude.toFixed(
      2,
  )}&lon=${searchCity.longitude.toFixed(2)}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching five day forecasts');
    }
    // wait for the response to be converted to json
    const data = await response.json();
    let dayForecast = new Forecast();
    if (data) {
      let forecastDateUTC = 0;
      let currentDate = searchCity.currentWeather.date;
      let initialisedForecast = false;
      let forecastIterator = 0;
      let haveFirstDate = false;
      for (let i = 0; i < data.list.length; i++) {
        forecastDateUTC = data.list[i].dt;
        const forecastDate = dayjs.utc(data.list[i].dt_txt, 'YYYY-MM-DD HH:mm:ss').local();
        if (forecastDate.isAfter(dayjs(), 'day')) {
          // this is a forecast for a future day

          // get the first date
          if (!haveFirstDate) {
            currentDate = dayjs.utc(data.list[i].dt_txt, 'YYYY-MM-DD HH:mm:ss').local();
            haveFirstDate = true;
          }
          const forecastDate = dayjs.utc(data.list[i].dt_txt, 'YYYY-MM-DD HH:mm:ss').local();
          if (forecastDate.isSame(currentDate, 'day')) {
          // this is still current day's forecast
          // check if it is the first forecast for the day and capture the min and max
            if (!initialisedForecast) {
              dayForecast.min = data.list[i].main.temp_min;
              dayForecast.max = data.list[i].main.temp_max;
              initialisedForecast = true;
            } else {
            // update the min and max for the day
              if (data.list[i].main.temp_min < dayForecast.min) {
                dayForecast.min = data.list[i].main.temp_min;
              }
              if (data.list[i].main.temp_max > dayForecast.max) {
                dayForecast.max = data.list[i].main.temp_max;
              }
            }
            // if the time is <=12 pm, capture the weather icon and other stuff
            if (forecastDate.hour() <= 14) {
              dayForecast.icon = data.list[i].weather[0].icon;
              dayForecast.description = data.list[i].weather[0].description;
              dayForecast.humidity = data.list[i].main.humidity;
              dayForecast.wind = data.list[i].wind.speed;
              dayForecast.windDegrees = data.list[i].wind.deg;
              dayForecast.windGust = data.list[i].wind.gust;
            }
          } else {
          // this is a new day's forecast
            const thisForecast = searchCity.fiveDayForecast[forecastIterator];
            saveDateForeCast(currentDate, thisForecast, dayForecast);
            forecastIterator++;
            initialisedForecast = false;
            // set the current date to the new date
            currentDate = forecastDate;
            // check if this is the last forecast to be captured in case the data rolls over to the next day
            if (forecastIterator == 4) {
              break;
            } else {
            // reset the day forecast
              dayForecast = new Forecast();
            }
          }
        }
      }
      // save the final forecast
      const thisForecast = searchCity.fiveDayForecast[forecastIterator];
      saveDateForeCast(currentDate, thisForecast, dayForecast);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    alertModal('API Error in getFiveDayForecast', error.message);
    return false;
  }
}

// copy the new forecast data into the destination 5-day forecast
function saveDateForeCast(forecastDate, destinationForecast, dataForecast) {
  destinationForecast.date = forecastDate;
  destinationForecast.min = dataForecast.min;
  destinationForecast.max = dataForecast.max;
  destinationForecast.icon = dataForecast.icon;
  destinationForecast.description = dataForecast.description;
  destinationForecast.humidity = dataForecast.humidity;
  destinationForecast.wind = dataForecast.wind;
  destinationForecast.windDegrees = dataForecast.windDegrees;
  destinationForecast.windGust = dataForecast.windGust;
  destinationForecast.hasData = true;
}

// ====================================================================================================
// ! Display the selected list of cities
// ====================================================================================================
function populateCityList(listName) {
  // clear the list
  $('#current-city-list-name').text(listName);
  // clear the search box
  $('#input-search-city').val('');
  // set the favourite emoji
  const favouriteEmoji = '⭐';
  let cityListHTML = '';
  let buttonsListHTML = '';
  let showDeleteButton = false;
  let isFavouriteList = false;
  switch (listName) {
    case 'Search History':
      // only show delete button on search history list
      showDeleteButton = true;
      break;
    case 'Favourites':
      isFavouriteList = true;
      break;
    default:
      showDeleteButton = false;
      break;
  }
  // filter the citiesCombinedList to get the desired cities for the list
  let selectedCities = [];
  if (isFavouriteList) {
    selectedCities = citiesCombinedList.filter((city) => city.isFavourite);
  } else {
    selectedCities = citiesCombinedList.filter((city) => city.listName === listName);
  }

  // make sure the list items are unique (eg if a city is in both search history and world cities and is a favourite)
  const uniqueCityArray = Object.values(selectedCities.reduce((unique, testCity) => {
    // Create a composite key based on the two properties
    const compositeKey = `${testCity.cityName}_${testCity.countryCode}`;
    if (!unique[compositeKey]) {
      unique[compositeKey] = testCity;
    }
    return unique;
  }, {}));

  // set the class that determines the width of the button area, which also therefore sets the width of the list items
  const classDeleteButton = (showDeleteButton ? '' : 'd-none');
  const classButtons = (showDeleteButton ? 'toolbar-two' : 'toolbar-one');
  $('#city-list-toolbars').removeClass('toolbar-one toolbar-two').addClass(classButtons);
  $('#city-list-toolbars').addClass(classButtons);

  // iterate through the cities in the city list, creating the HTML for each city
  uniqueCityArray.forEach((cityInList) => {
    const cityName = cityInList.cityName;
    const countryCode = cityInList.countryCode;
    const cityBadgeId = 'city-badge-' + cityName + '-' + countryCode;
    const cityDivId = 'displayed-city-' + cityName + '-' + countryCode;
    const isCurrentCity = (cityName === selectedCity.cityName && countryCode === selectedCity.countryCode);
    let isFavourite = cityInList.isFavourite;

    // if the city is the current city, then use the isFavourite value from the selectedCity object
    if (!isFavourite && isCurrentCity) {
      isFavourite = selectedCity.isFavourite;
      cityInList.isFavourite = isFavourite;
    }

    // create the badge of the retrieved city current temperature if it exists and the favourite emoji if it is a favourite
    const classFavourite = (isFavourite ? 'favourite-city' : '');
    const cityDisplayName = (isFavourite ? favouriteEmoji + ' ' : '') + cityName;
    const classIsCurrentCity = (isCurrentCity ? classFavourite + ' active bg-success' : classFavourite + ' bg-light');
    const classBadgeIsCurrentCity = (isCurrentCity ? 'bg-light text-success' : 'bg-success');

    let currentTemperature = '';
    if (isCurrentCity) {
      // update the current city badge
      currentTemperature = formatTemperature(selectedCity.currentWeather.temperature);
    } else if (cityInList.currentWeather.hasData) {
      // update the current city badge
      currentTemperature = formatTemperature(cityInList.currentWeather.temperature);
    }

    // create the city list item HTML using string literals
    cityListHTML += `<div class="d-flex justify-content-between align-items-baseline list-group-item list-group-item-action ${classIsCurrentCity} px-1 mx-0 fs-6 ${classFavourite}" 
          aria-current="false" id="${cityDivId}">${cityDisplayName}<span class="badge ${classBadgeIsCurrentCity} rounded-pill" id="${cityBadgeId}">${currentTemperature}</span></div>`;

    // create the buttons HTML using string literals
    buttonsListHTML += `<div class="btn-toolbar justify-content-end" role="toolbar" aria-label="City item functions">
       <button type="button" class="favourite-button btn btn-outline-info custom-sml-btn" id="fav-btn-${cityName}-${countryCode}">⭐</button><button type="button" 
       class="delete-button btn btn-outline-info custom-sml-btn ${classDeleteButton}" id="del-btn-${cityName}-${countryCode}">🗑️</button></div>`;
  });

  // add the HTML to the page
  $('#searched-city-list').html(cityListHTML);
  $('#city-list-toolbars').html(buttonsListHTML);
}

// ====================================================================================================
// ! Utility functions
// ====================================================================================================

// translate the wind direction degrees to a compass direction
function convertWindDegreesToDirection(degrees) {
  const windDirections = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(degrees / 22.5) % 16; // 360 / 16 = 22.5, eliminates fractional part
  return windDirections[index];
}

// ensure the first letter of each word is capitalised to avoid the API returning an error or duplicating cities
// https://www.w3docs.com/snippets/javascript/how-to-convert-string-to-title-case-with-javascript.html
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// OpenWeatherMap API key is slightly obfuscated to avoid bots scraping it
function cleverlyObfuscatedSecret() { // sarcasm
  return '87d4b' + '5d4ee' + 'bf3cc71' + 'c9b38b2' + '60b1b8ea';
}

// format a temperature value to 1 decimal place and add the degree symbol
function formatTemperature(temperature) {
  return `${temperature.toFixed(1)}°C`;
};

// format a wind speed value to 1 decimal place and add the km/h unit
function formatWindSpeed(windSpeed) {
  if (windSpeed === undefined) return '';
  return `${(parseFloat(windSpeed) * 3.6).toFixed(1)} km/h`;
}

// modal form stuff
function alertModal(title, message) {
  $('#alert-modal-title').text(title);
  $('#alert-modal-text').text(message);
  $('#alert-modal').modal('show');
}

// =================================================================================================
// ! Event Listeners
// =================================================================================================
// search for a city
const searchCityButton = document.getElementById('search-city-btn');
searchCityButton.addEventListener('click', searchForCity);

// validate the search form and search for a city if the form is valid
async function searchForCity(event) {
  event.preventDefault();
  let city = document.getElementById('input-search-city').value.trim();
  const country = document.getElementById('input-country').value;
  if (city.length > 0 && country.length > 0) {
    city = toTitleCase(city);
    await newCitySearch(city, country);
  } else {
    alertModal('Not enough information', 'Please enter a city and choose a country.');
  }
}

// search for a city when the user presses the enter key
async function newCitySearch(cityName, countryCode, listName = 'Search History') {
  // see if the city is already in the list - saves calling the geo API for lat/long
  let matchingCities = [];
  if (listName === 'Favorites') {
    matchingCities = citiesCombinedList.filter((city) => city.isFavourite && city.cityName === cityName && city.countryCode === countryCode);
  } else {
    matchingCities = citiesCombinedList.filter((city) => city.cityName === cityName && city.countryCode === countryCode && city.listName === listName);
  }

  // set up the searchCity object
  if (matchingCities.length > 0 ) {
    // get a copy of the city object
    searchCity = matchingCities[0].clone();
  } else {
    // No match; clear the current city
    searchCity= new City(cityName, countryCode);
    searchCity.listName = listName;
  }

  // all good, so get the weather data
  const success = await getWeatherData();
  if (success) {
    // set the selected city to the search city, save it to the city list and display the forecast
    cloneSearchToSelected();

    // display the city list
    populateCityList(listName);
  }
}

// 'Favourites' - the list of favourite cities
// 'Search History' - the list of cities that have been searched for
// 'World Cities' - the list of cities that have been loaded from the world cities file
// 'Australian Capitals' - the list of Australian Capitals
// 'New Zealand Cities' - the list of New Zealand cities
$('.dropdown-item').click(function() {
  const selectedAction = $(this).text();
  switch (selectedAction) {
    case 'Favourites':
    case 'Search History':
    case 'World Cities':
    case 'Australian Capitals':
    case 'New Zealand Cities':
      populateCityList(selectedAction);
      break;
    default:
      break;
  }
});

// detect a click on one of the listed cities
$('#searched-city-list').on('click', '.list-group-item', async function() {
  const cityID = $(this).attr('id');
  const cityNameAndCountryCode = cityID.substring(15);
  const cityName= cityNameAndCountryCode.split('-')[0];
  const countryCode = cityNameAndCountryCode.split('-')[1];
  if (cityName && countryCode) {
    // clear the city search box
    $('#input-search-city').val('');
    const listType = $('#current-city-list-name').text();
    // call the apis and update and display the weather data
    await newCitySearch(cityName, countryCode, listType);
  };
});

// detect a click on the favourite button
$('#city-list-toolbars').on('click', '.favourite-button', function() {
  const cityID = $(this).attr('id');
  const cityNameAndCountryCode = cityID.substring(8);
  const cityName= cityNameAndCountryCode.split('-')[0];
  const countryCode = cityNameAndCountryCode.split('-')[1];
  if (cityName && countryCode) {
    // find the city in the list, toggle the favourite status and save the list
    const matchingCities = citiesCombinedList.filter((city) => city.cityName === cityName && city.countryCode === countryCode);
    if (matchingCities.length > 0 ) {
      matchingCities.forEach((city) => {
        city.isFavourite = !city.isFavourite;
      });
      saveCityList();
    }
    // now reload the list
    const listType = $('#current-city-list-name').text();
    populateCityList(listType);
  };
});

// detect a click on the delete button and remove the city from the search history list
$('#city-list-toolbars').on('click', '.delete-button', function() {
  const cityID = $(this).attr('id');
  const cityNameAndCountryCode = cityID.substring(8);
  const cityName= cityNameAndCountryCode.split('-')[0];
  const countryCode = cityNameAndCountryCode.split('-')[1];
  if (cityName && countryCode) {
    // find the city in the list, toggle the favourite status and save the list
    if ( removeCityFromList(cityName, countryCode, 'Search History')) {
      populateCityList('Search History');
    }
  }
});

// detect a click on the world-map button and load a new browser tab with a URL to OpenStreetMap with the selectedCity latitude and longitude
var worldMapButton = document.getElementById('world-map');
worldMapButton.addEventListener('click', function() {
  if (selectedCity.latitude && selectedCity.longitude) {
    const url = `https://www.openstreetmap.org/#map=10/${selectedCity.latitude.toFixed(2)}/${selectedCity.longitude.toFixed(2)}`;
    window.open(url, '_blank');
  };
});

