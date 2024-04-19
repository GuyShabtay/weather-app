import axios from 'axios';
import { useSelector } from 'react-redux';
const apiKey = import.meta.env.VITE_API_KEY;
const cityKey = useSelector((state) => state.weatherConditions.currentDay.cityKey);

export const getCityName = async (cityName) => {

  console.log(cityName)
  const base = 'http://dataservice.accuweather.com/locations/v1/cities/search';
  const query = `?apikey=${apiKey}&q=${cityName}`;
  try {
    console.log(base + query)
    const response = await axios.get(base + query);
    console.log(response.data[0].Key)

    return response.data[0].Key;
  } catch (error) {
    console.error('Error fetching city name:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
};

export const getCurrentConditions = async (cityKey,cityName) => {
  const base = 'http://dataservice.accuweather.com/currentconditions/v1/';
  const query = `${cityKey}?apikey=${apiKey}`;
  try {
    const currentDetails = await axios.get(base + query).data[0];
    let currentConditions = {};
    currentConditions.cityName=cityKey,
    currentConditions.cityKey=cityName,
    currentConditions.weather.weatherText = currentDetails.WeatherText;
    currentConditions.weather.weatherIcon = currentDetails.WeatherIcon;
    currentConditions.weather.temperatureC = Math.floor(currentDetails.Temperature.Metric.Value);
    currentConditions.weather.temperatureF = Math.floor(currentDetails.Temperature.Imperial.Value);
    console.log(currentConditions)
    return currentConditions;
  } catch (error) {
    console.error('Error fetching city conditions:', error);
    throw error;
  }
};

export const getNextFiveDaysConditions = async (cityKey) => {
  const base = 'http://dataservice.accuweather.com/forecasts/v1/daily/5day/';
  const query = `${cityKey}?apikey=${apiKey}`;
  try {
    const response = await axios.get(base + query);
    let nextFiveDaysConditions = [];
    response.data.DailyForecasts.map((item, index) => {
      const minTemperatureC = fahrenheitToCelsius(
        item.Temperature.Minimum.Value
      );
      const maxTemperatureC = fahrenheitToCelsius(
        item.Temperature.Maximum.Value
      );
      nextFiveDaysConditions.push({
        dayIcon: item.Day.Icon,
        minTemperatureF: item.Temperature.Minimum.Value,
        maxTemperatureF: item.Temperature.Maximum.Value,
        minTemperatureC: minTemperatureC,
        maxTemperatureC: maxTemperatureC,
      });
      return null; // Make sure to return something to satisfy the map function
    });
    return nextFiveDaysConditions;
  } catch (error) {
    console.error('Error fetching next five days conditions:', error);
    throw error;
  }
};

export const getAutoComplete = async (searchInput) => {
  const base = 'http://dataservice.accuweather.com/locations/v1/cities/autocomplete';
  const query = `?apikey=${apiKey}&q=${searchInput}`;
  try {
    const autoComplitions = await axios.get(base + query);
    const maxFiveAutoComplitions=autoComplitions.data.slice(0, 5); // Limit the maximum number of items to 5
    const autoComplitionsCitiesNames=maxFiveAutoComplitions.map((item, index) => {
        return item.LocalizedName;
    });
  const citiesNamesWithoutDuplicates = [...new Set(autoComplitionsCitiesNames)];
    return citiesNamesWithoutDuplicates;
  } catch (error) {
    console.error('Error fetching auto complete:', error);
    throw error;
  }
};


const fahrenheitToCelsius = (fahrenheitTemperature) => {
  return Math.floor((fahrenheitTemperature - 32) / 1.8);
};
// const celsiusTofahrenheit = (celsiusTemperature) => {
//   return Math.floor((celsiusTemperature * 1.8) + 32);
// };

// // Usage example
// getCity('manchester')
//   .then((data) => console.log(data))
//   .catch((error) => console.error(error)); // Log the error properly
