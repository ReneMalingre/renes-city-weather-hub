
// ==========================================================================================================
// Class Definitions

// class to hold the forecast data
class Forecast {
  constructor() {
    this.date = '';
    this.icon = '';
    this.temperature = 0;
    this.min = 0;
    this.max = 0;
    this.wind = 0;
    this.windDegrees =0;
    this.humidity = 0;
    this.description = '';
    this.feelsLike = 0;
    this.unixUTC = 0;
    this.hasData = false;
  }
  // copy info to a new forecast object
  clone() {
    const newForecast = new Forecast();
    newForecast.date = this.date;
    newForecast.icon = this.icon;
    newForecast.temperature = this.temperature;
    newForecast.min = this.min;
    newForecast.max = this.max;
    newForecast.wind = this.wind;
    newForecast.windDegrees = this.windDegrees;
    newForecast.humidity = this.humidity;
    newForecast.description = this.description;
    newForecast.feelsLike = this.feelsLike;
    newForecast.unixUTC = this.unixUTC;
    newForecast.hasData = this.hasData;
    return newForecast;
  }

  // display the forecast temperature
  setTemperature(id, shortFormat, isCurrent) {
    if (this.hasData) {
      if (!shortFormat) {
        let tempIntro = 'Temp: ';
        if (isCurrent) tempIntro = 'Current ' + tempIntro;
        $(id).text(tempIntro +
          this.temperature.toFixed(1) + ' °C, feels like: ' +
          this.feelsLike.toFixed(1) +
          ' °C. Min: ' + this.min.toFixed(1) + ' °C, max: ' +
          this.max.toFixed(1) + ' °C');
      } else {
        $(id).text('Temp: min: ' + this.min.toFixed(1) + ' °C, max: ' + this.max.toFixed(1) + ' °C');
      }
    } else {
      $(id).text('Temp: unknown');
    }
  }
  // display the forecast wind
  setWind(id, shortFormat) {
    if (this.hasData) {
      if (shortFormat) {
        $(id).text('Wind: ' + this.wind.toFixed(1) + ' m/s, ' + convertWindDegreesToDirection(this.windDegrees) );
      } else {
        $(id).text('Current Wind: ' + this.wind.toFixed(1) + ' m/s, ' + convertWindDegreesToDirection(this.windDegrees));
      }
    } else {
      $(id).text('Wind: unknown');
    }
  }
  // display the forecast humidity
  setHumidity(id, shortFormat) {
    if (this.hasData) {
      if (shortFormat) {
        $(id).text('Humidity: ' + this.humidity + '%');
      } else {
        $(id).text('Current Humidity: ' + this.humidity + '%');
      }
    } else {
      $(id).text('Humidity: unknown');
    }
  }
  // display the forecast icon
  setIcon(id) {
    if (this.hasData && this.icon.length > 0) {
      $(id).attr({
        'src': 'http://openweathermap.org/img/wn/' + this.icon + '@4x.png',
        'alt': this.description});
    } else {
      $(id).attr({
        'src': '',
        'alt': ''});
    }
  }
}

class City {
  constructor(cityName, countryCode) {
    this.cityName = cityName;
    this.countryCode = countryCode;
    this.countryName = '';
    this.stateName = '';
    this.latitude = 0;
    this.longitude = 0;
    this.currentWeather = new Forecast();
    this.fiveDayForecast = [new Forecast(), new Forecast(), new Forecast(), new Forecast(), new Forecast()];
    this.hasData = false;
    this.listName = '';
    this.isFavourite = false;
  }
  // wipe the city data
  clearData() {
    this.cityName = '';
    this.countryCode = '';
    this.countryName = '';
    this.stateName = '';
    this.latitude = 0;
    this.longitude = 0;
    this.currentWeather = new Forecast();
    this.fiveDayForecast = [new Forecast(), new Forecast(), new Forecast(), new Forecast(), new Forecast()];
    this.listName = '';
    this.hasData = false;
    this.isFavourite = false;
  }
  // copy info to a new city object
  clone() {
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
  cloneFiveDayForecast() {
    const newFiveDayForecast = [];
    for (let i = 0; i < this.fiveDayForecast.length; i++) {
      newFiveDayForecast.push(this.fiveDayForecast[i].clone());
    }
    return newFiveDayForecast;
  }
  fiveDayForecastHasData(value) {
    for (let i = 0; i < this.fiveDayForecast.length; i++) {
      this.fiveDayForecast[i].hasData = value;
    }
  }

  // save the city as the default city to local storage so it can be retrieved later
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

  serialize() {
    // serialize the city object
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

  deserialize(serialized) {
    this.clearData();
    this.cityName = serialized.cityName;
    this.countryCode = serialized.countryCode;
    this.countryName = serialized.countryName;
    this.stateName = serialized.stateName;
    this.latitude = serialized.latitude;
    this.longitude = serialized.longitude;
    this.isFavourite = serialized.isFavourite;
    this.listName = serialized.listName;
  }

  setHeroUI() {
    // display basic information about the city
    $('#hero-city-name').text(this.formatCityName());

    // display the current local time
    $('#hero-city-date').text(this.formatCurrentDate());

    // display the current weather icon
    this.currentWeather.setIcon('#hero-city-icon');
    // weather description
    $('#hero-city-description').text(this.currentWeather.description);

    // forecast date date
    if (this.currentWeather.unixUTC > 0) {
      $('#hero-city-forecast-date').text('Data created: ' + dayjs(this.currentWeather.unixUTC).format('hh:mm a'));
    } else {
      $('#hero-city-forecast-date').text('Data created: unknown');
    }

    // temperature
    this.currentWeather.setTemperature('#hero-city-temps', false, true);
    // wind
    this.currentWeather.setWind('#hero-city-wind', false);
    // humidity
    this.currentWeather.setHumidity('#hero-city-humidity', false);
  }

  formatCityName() {
    let cityName = this.cityName;
    if (this.stateName.length > 0) {
      cityName += ', ' + this.stateName;
    }
    if (this.countryName.length > 0) {
      cityName += ', ' + this.countryName;
    }
    return cityName;
  }

  formatCurrentDate() {
    return 'Current weather for today, ' + dayjs().format('dddd, d MMMM, YYYY');
  }
}

// class to hold the country code and name
class Country {
  constructor(countryCode, countryName) {
    this.countryCode = countryCode;
    this.countryName = countryName;
  }
}
// ==========================================================================================================
// GLOBALS
// ==========================================================================================================
// array of Country objects, which hold country codes and names - used to convert country code to country name and vice versa
let countryList=[];
// a city object to hold the info about the city that is being searched for
var searchCity = new City('', '');

// the currently selected city
var selectedCity = new City('', '');

// hold the list of cities that have been searched for
var searchedCities = [];

// ==========================================================================================================
// Load Existing Data
// ==========================================================================================================
// Load default city
function loadLastCity() {
  // Get last selected city from local storage
  selectedCity.loadAsDefault();
  if (!selectedCity.cityName) {
    // if no city was found in local storage, use the default city of Adelaide, Australia
    selectedCity = new City('Adelaide', 'AU');
    selectedCity.countryName = 'Australia';
    selectedCity.stateName = 'South Australia';
    selectedCity.latitude = -34.92;
    selectedCity.longitude = 138.60;
  }
  return;
}

const searchCityButton= document.getElementById('search-city-btn');
searchCityButton.addEventListener('click', searchForCity);

async function searchForCity(event) {
  event.preventDefault();
  let city = document.getElementById('input-search-city').value;
  const country = document.getElementById('input-country').value;
  console.log(city + ' ' + country);
  if (city.length > 0 && country.length > 0) {
    city = toTitleCase(city);
    await newCitySearch(city, country);
  } else {
    alert('Please enter a city and country');
  };
}

async function newCitySearch(city, country) {
  // see if the city is already in the list
  // clear the current city
  searchCity.clearData();
  // set the city name and country code
  searchCity.cityName = city;
  searchCity.countryCode = country;
  // get the weather data
  const success = await getWeatherData();
  if (success) {
    // set the UI
    searchCity.setHeroUI();
    // set the five day forecast
    searchCity.setFiveDayForecast();
    // set the city as the default city
    searchCity.saveAsDefault();
  }
}

// here is where the magic happens and the weather data is retrieved
// using the searchCity object to hold the city and country info
async function getWeatherData() {
  // see if we already have latitude and longitude for the city
  let success = true;
  if (searchCity.latitude == 0 && searchCity.longitude == 0) {
    // if not, get the lat and long
    success = await getLatAndLong();
    if (!success) {
      alert('Could not retrieve the city coordinates');
      return false;
    }
  }
  // check again for coordinates
  if (searchCity.latitude==0 && searchCity.longitude==0) {
    alert('Could not retrieve weather information as the city coordinates could not be found');
    success = false;
  } else {
    // have coordinates, so get the weather data
    let success = await getCurrentWeather();
    if (success) {
      success = await getFiveDayForecast();
      if (!success) {
        alert('Could not retrieve five day forecast weather information');
      }
    } else {
      alert('Could not retrieve weather information');
    }
  }
  return success;
}


async function getLatAndLong() {
  const apiKey = cleverlyObfuscatedSecret();
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${searchCity.cityName},${searchCity.countryCode}&appid=${apiKey}`;
  console.log(url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      throw new Error('Error fetching countries');
    }
    // wait for the response to be converted to json
    const data = await response.json();
    if (data) {
      // console.log('=========================== Lat and Long ===========================');
      // console.log(data);
      // console.log('=========================== End Lat and Long ===========================');
      searchCity.latitude = data[0].lat;
      searchCity.longitude = data[0].lon;
      if (data[0].hasOwnProperty('state')) {
        searchCity.stateName = data[0].state;
      } else {
        searchCity.stateName = '';
      }
      // convert to country name
      // searchCity.countryName = getCountryName(searchCity.countryCode);
      return true;
    } else {
      console.log('No data');
      searchCity.latitude=0;
      searchCity.longitude=0;
      searchCity.stateName = '';
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getFiveDayForecast() {
  const apiKey = cleverlyObfuscatedSecret();
  const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${searchCity.latitude.toFixed(2)}&lon=${searchCity.longitude.toFixed(2)}&appid=${apiKey}&units=metric`;
  console.log(url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      throw new Error('Error fetching five day forecasts');
    }
    // wait for the response to be converted to json
    const data = await response.json();
    if (data) {
      console.log('=========================== 5 -Day Forecast ===========================');
      console.log(data);
      console.log('=========================== End 5 -Day Forecast ===========================');
      // display the data on the page
      // clear the previous data
      return true;
    } else {
      console.log('No data');
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

// TODO - dynamically add all of the 5-day forecast elements to the page
function clearUI5DayForecast() {
  for (let i = 1; i < 6; i++) {
    const elementName ='5-day-forecast-day-' + i.toString();
    const forecastCard =$(`#${elementName}`);
    // console.log(forecastCard.innerHTML);

    const forecastDate = forecastCard.find('#5day-Date-' + i);
    // console.log(forecastDate.text());
    const forecastBody= forecastCard.find('.card-body');
    // console.log(forecastBody.html());
    const forecastIcon=forecastBody.find('.forecast-icon');
    // console.log(forecastIcon.html());
    const forecastTemp=forecastBody.find('.forecast-temp');
    // console.log(forecastTemp.html());
    const forecastWind=forecastBody.find('.forecast-wind');
    // console.log(forecastWind.html());
    const forecastHumidity=forecastBody.find('.forecast-humidity');
    // console.log(forecastHumidity.html());
    forecastDate.text(i +' Date');
    forecastIcon.html('<img src="http://openweathermap.org/img/wn/01d.png" alt="Clear sky (day)">');
    forecastTemp.text(i + ' Temp');
    forecastWind.text(i + ' Wind');
    forecastHumidity.text(i +' Humidity');
  };
}

// function updateUICurrentWeather() {
//   $('#hero-city-name').text(searchCity.cityName + ', ' + (searchCity.stateName.length>0 ? searchCity.stateName + ', ' : '') + searchCity.countryName);
//   $('#hero-city-date').text('Forecast for today, ' + dayjs().format('dddd, D MMMM, YYYY'));
//   $('#hero-city-temps').text(searchCity.currentWeather.temperature);
//   $('#hero-city-wind').text(searchCity.currentWeather.wind);
//   $('#hero-city-humidity').text(searchCity.currentWeather.humidity);
//   $('#hero-city-icon').attr('src', 'http://openweathermap.org/img/wn/' + searchCity.currentWeather.icon + '@2x.png' );
//   $('#hero-city-icon').attr('alt', searchCity.currentWeather.description);
//   $('#hero-city-description').text(searchCity.currentWeather.description);
// }


async function getCurrentWeather() {
  const apiKey = cleverlyObfuscatedSecret();
  const url = `http://api.openweathermap.org/data/2.5/weather?lat=${searchCity.latitude.toFixed(2)}&lon=${searchCity.longitude.toFixed(2)}&appid=${apiKey}&units=metric`;
  // console.log(url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      searchCity.hasData = false;
      searchCity.currentWeather.hasData = false;
      searchCity.fiveDayForecastHasData = false;

      throw new Error('Error fetching current weather');
    }
    // wait for the response to be converted to json
    const data = await response.json();
    if (data) {
      console.log('=========================== Current Weather Data ===========================');
      console.log(data);
      // grab the data and put it into the currentCity object
      searchCity.currentWeather.date = dayjs();
      searchCity.currentWeather.temperature = data.main.temp;
      searchCity.currentWeather.feelsLike = data.main.feels_like;
      searchCity.currentWeather.min = data.main.temp_min;
      searchCity.currentWeather.max = data.main.temp_max;
      searchCity.currentWeather.wind = data.wind.speed;
      searchCity.currentWeather.windDegrees = data.wind.deg;
      searchCity.currentWeather.humidity = data.main.humidity;
      searchCity.currentWeather.icon = data.weather[0].icon;
      searchCity.currentWeather.description = data.weather[0].description;
      searchCity.currentWeather.unixUTC = data.dt;
      searchCity.currentWeather.hasData = true;
      searchCity.hasData=true;

      console.log('=========================== End Current Weather Data ===========================');
      return true;
    } else {
      console.log('No data');
      return false;
    }
  } catch (error) {
    console.log(error);
    searchCity.hasData = false;
    return false;
  }
}

// copy the searchCity object to the selectedCity object
function cloneSearchToCity() {
  selectedCity=searchCity.clone();
  // save the selected city to local storage
  selectedCity.saveAsDefault();
  // update the hero UI with the current weather data
  selectedCity.setHeroUI();
}

$(document).ready(async function() {
  // load the last city from local storage or use the default city (Adelaide, AU)
  loadLastCity();
  // display the last city, firstly without weather detail just to make the page look nice
  selectedCity.setHeroUI();
  // get the current weather for the last city
  // copy the selectedCity object to the searchCity object which is used to get the current weather via APIs
  searchCity = selectedCity.clone();
  searchCity.hasData = false;
  await getWeatherData();
  if (searchCity.hasData) {
    // copy the searchCity object to the selectedCity object and display the data
    cloneSearchToCity();
    // add the city to the list of searched cities
    selectedCity.isFavourite = true;
    selectedCity.listName = 'Searched Cities';
    addSelectedCityToList();
  }
  // get the city list out of local storage
  loadCityList();

  // populate the country select list
  hydrateCountryList();
  clearUI5DayForecast();
});

function loadCityList() {
  searchedCities=[];
  // deserialize the city list from local storage
  const cityList = JSON.parse(localStorage.getItem('cityList'));

  if (cityList) {
    // if there is a city list in local storage then add it to the searchedCities array
    // iterate through the cities in the city list
    for (let i=0; i<cityList.cities.length; i++) {
      const newCity =new City('', '');
      newCity.deserialize(cityList.cities[i].serializedCity);
      searchedCities.push(newCity);
    }
  }
}

function saveCityList() {
  // serialize the city list to local storage
  const serialized = {
    cities: [],
  };

  for (let i = 0; i < searchedCities.length; i++) {
    let saveCity = new City('', '');
    saveCity = searchedCities[i];
    const serializedCity = saveCity.serialize();
    serialized.cities.push({
      serializedCity,
    });
  }
  localStorage.setItem('cityList', JSON.stringify(serialized));
}

function addSelectedCityToList() {
  // add the city to the list of searched cities
  // there must not be an existing city in the list with the same name, state and country and listName
  // if there is then ignore it
  let found = false;
  for (let i = 0; i < searchedCities.length; i++) {
    if (searchedCities[i].name === selectedCity.name && searchedCities[i].state === selectedCity.state && searchedCities[i].country === selectedCity.country && searchedCities[i].listName === selectedCity.listName) {
      found = true;
      break;
    }
  }
  if (!found) {
    searchedCities.push(selectedCity);
  }

  // save the city list to local storage
  saveCityList();
}
function removeCityFromList(removedCity) {
  // remove the city from the list of cities
  // there must be an existing city in the list with the same name, state and country and listName
  // if there is then remove it
  for (let i = 0; i < searchedCities.length; i++) {
    if (searchedCities[i].name === removedCity.name && searchedCities[i].state === removedCity.state && searchedCities[i].country === removedCity.country && searchedCities[i].listName === removedCity.listName) {
      searchedCities.splice(i, 1);
      break;
    }
  }

  // save the city list to local storage
  saveCityList();
}

// Current Weather Data
// API Documentation: https://openweathermap.org/current
// http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
// Geocoding API http://openweathermap.org/api/geocoding-api
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// {city name} is obviously the city name
// {state code} is the US state code only
// {country code} is the ISO 3166 country code
// {limit} is the number of results to return (up to 5 can be returned)
// Geocoding coordinates by zip/post code http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
// {zip code} is the zip/post code
// {country code} is the ISO 3166 country code
// World Bank Country list http://api.worldbank.org/v2/country?format=json&per_page=50&page=2


// ===================================================================================================
// get all of the country codes from the world bank so that the user can select a country and
// we can use the country code for the weather api
// this is a bit tricky because the world bank api only returns 50 countries per page
// so we have to make multiple calls to the api to get all of the countries
// and use async and await to make sure the data is captured before we continue


async function hydrateCountryList() {
  // check local storage for the countries first
  countryList = JSON.parse(localStorage.getItem('countries'));
  // let baseURL = 'https://api.worldbank.org/v2/country?format=json';
  // console.log(baseURL);
  const baseURL = 'https://api.worldbank.org/v2/country';
  if (!countryList || countryList.length < 100) {
    // reset the global array that holds the countries
    countryList = [];
    // not in local storage, so get them from the world bank api
    // set up the initial search parameters
    const searchParameters = {format: 'json', per_page: 50, page: 1};
    // retrieving the countries from the world bank api but don't continue until it's done
    await retrieveCountries(baseURL, searchParameters);
    // save the countries to local storage ready for next time
    sortCountryList();
    localStorage.setItem('countries', JSON.stringify(countryList));
  }
  // now fill the country select list (input-country)
  const countrySelect = document.getElementById('input-country');
  // clear the select list
  countrySelect.innerHTML = '';
  // add back the instruction option plus Australia and New Zealand
  let selectOption = document.createElement('option');
  selectOption.value = '';
  selectOption.innerHTML = 'Choose the country';
  countrySelect.appendChild(selectOption);
  selectOption = document.createElement('option');
  selectOption.value = 'AU';
  selectOption.innerHTML = 'Australia';
  countrySelect.appendChild(selectOption);
  selectOption = document.createElement('option');
  selectOption.value = 'NZ';
  selectOption.innerHTML = 'New Zealand';
  countrySelect.appendChild(selectOption);

  // add the countries to the county select list
  sortCountryList();

  for (let i = 0; i < countryList.length; i++) {
    // get the key-value pair from the countryList array
    const kvp = countryList[i];
    // get the key (iso2Code) and the value (name) from the key-value pair
    const key = Object.keys(kvp)[0];
    // ignore AU and NZ because we've already added them
    if (!(key === 'AU' || key === 'NZ' || key === '')) {
    // create an option element for the select list
      const value = kvp[key];
      const option = document.createElement('option');
      option.value = key;
      option.innerHTML = value;
      // console.log(key + ' ' + value);
      // add the option element to the select list
      countrySelect.appendChild(option);
    }
  };
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
  const response = await fetch(url);
  if (!response.ok) {
    console.log(response);
    throw new Error('Error fetching countries');
  }
  // wait for the response to be converted to json
  const data = await response.json();
  // now add the countries to the global array
  for (let i = 0; i < data[1].length; i++) {
    // get a key-value pair of iso2Code and name from the country object
    // but only if it is a country not a region...
    if (data[1][i].region.id !=='NA') {
      const kvp = {};
      kvp[data[1][i].iso2Code] = data[1][i].name;
      // add the key-value pair to the global countryList array
      countryList.push(kvp);
    }
  }
  // console.log(countryList);
  // check if there are more pages of countries to retrieve
  if (data[0].pages > searchParameters.page) {
    // increment the page number and retrieve the next page recursively and await the response
    searchParameters.page++;
    await retrieveCountries(baseURL, searchParameters);
  }
}

function sortCountryList() {
  countryList.sort((a, b) => {
    const countryA = Object.values(a)[0];
    const countryB = Object.values(b)[0];
    return countryA.localeCompare(countryB);
  });
}

function convertWindDegreesToDirection(degrees) {
  const windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return windDirections[index];
}

// https://www.w3docs.com/snippets/javascript/how-to-convert-string-to-title-case-with-javascript.html
function toTitleCase(str) {
  return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      },
  );
}

function cleverlyObfuscatedSecret() {
  return '87d4b' + '5d4ee' + 'bf3cc71' + 'c9b38b2' + '60b1b8ea';
}
