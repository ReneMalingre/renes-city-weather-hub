// Usage example:
//   getWeatherData('London', 'uk', 'handleWeatherData');
// create an event listener for the get-weather-button button
const testButton= document.getElementById('get-weather-button');
testButton.addEventListener('click', getLondonWeatherData);

function getLondonWeatherData() {
//   getWeatherData('London', 'uk');
};

function getWeatherData(city, countryCode) {
  const apiKey = 'ad514a1123c1e663f89399f0382f2c4b';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${apiKey}`;

  fetch(url)
      .then((response) => response.json())
      .then((data) => handleWeatherData(data))
      .catch((error) => console.error('Error fetching weather data:', error));
}

function handleWeatherData(data) {
  if (data.cod === 200) {
    console.log('Weather data:', data);
  } else {
    console.error('Error fetching weather data:', data.message);
  }
}
