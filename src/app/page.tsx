'use client';
import React, { useEffect, useState } from 'react';
import { getCoordinatesByLocationName, getCurrentWeather } from '@/api/weather';
import { getItem, removeItem, setItem } from '@/storage/weather';
import { convertTZ } from '@/utils/time';
import * as i18nIsoCountries from 'i18n-iso-countries';

i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));
i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/vi.json'));

type Weather = {
  name: string;
  sys: {
    country: string;
  };
  coord: {
    lat: string;
    lon: string;
  };
  main: {
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: {
    description: string;
    main: string;
  }[];
  dt: number;
  timezone: number;
};

export default function Home() {
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<Weather | null>();
  const [weatherList, setWeatherList] = useState<Weather[]>();
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    getStorageData();
  }, []);

  const getStorageData: () => Promise<void> = async () => {
    const data = await getItem();
    setWeatherList(data);
  };

  const getWeather = async (lat: string, lon: string) => {
    if (!lat || !lon) {
      setErrorMessage('Not found');
      return;
    }
    const weatherData = await getCurrentWeather(lat, lon);
    if (!weatherData) {
      setErrorMessage('Not found');
      return;
    } else {
      setErrorMessage('');
      setCurrentWeather(weatherData);
      await setItem(JSON.stringify(weatherData));

      await getStorageData();
    }
  };

  const handleSearch = async () => {
    setCurrentWeather(null);
    setErrorMessage('');

    const countryCode = i18nIsoCountries.getAlpha2Code(country, 'en') ?? '';
    const coordinatesData = await getCoordinatesByLocationName(
      city,
      countryCode,
    );

    if (!coordinatesData) {
      setErrorMessage('Not found');
    } else {
      await getWeather(coordinatesData.lat, coordinatesData.lon);
    }
  };

  const handeSearchFromHistory = async (weather: Weather) => {
    setCurrentWeather(null);
    setCity(weather.name);
    const countryName =
      i18nIsoCountries.getName(weather.sys.country, 'en') ?? '';
    setCountry(countryName);

    await getWeather(weather.coord.lat, weather.coord.lon);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-5 md:p-20">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className={'w-full'}>
          <h2
            className={'text-xl font-bold pb-3 border-b-2 border-b-black mb-5'}
          >
            Today's Weather
          </h2>
          <div className={'md:flex'}>
            <div className={'mb-5 md:mb-0 flex items-center'}>
              <span className={'mr-1'}>City: </span>
              <input
                className={
                  'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                }
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                }}
              />
            </div>
            <div className={'md:ml-5 mb-5 md:mb-0 flex items-center'}>
              <span className={'mr-1'}>Country: </span>
              <input
                className={
                  'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                }
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                }}
              />
            </div>
            <div className={'flex'}>
              <button
                className={
                  'md:ml-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                }
                onClick={handleSearch}
              >
                Search
              </button>
              <button
                className={
                  'ml-5 border border-gray-500 hover:bg-red-700 hover:text-white text-gray font-bold py-2 px-4 rounded'
                }
                onClick={() => {
                  setCity('');
                  setCountry('');
                  setCurrentWeather(null);
                  setErrorMessage('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          className={'mt-10 mb-10 p-5 max-w-5xl w-full border border-red-500'}
        >
          {errorMessage}
        </div>
      )}
      {currentWeather && (
        <div
          className={
            'md:pl-10 md:pr-10 mt-5 z-10 max-w-5xl w-full items-center justify-between font-mono text-sm'
          }
        >
          <div className={'current-location'}>
            {currentWeather.name}, {currentWeather.sys.country}
          </div>
          <h3 className={'text-3xl font-bold'}>
            {currentWeather.weather[0].main}
          </h3>
          <div className={'weather-summary md:w-1/2'}>
            <div className={'flex justify-between'}>
              <div>Description:</div>
              <div>{currentWeather.weather[0].description}</div>
            </div>
            <div className={'flex justify-between'}>
              <div>Temperature:</div>
              <div>
                {Math.round(currentWeather.main.temp_min - 273)}°C ~{' '}
                {Math.round(currentWeather.main.temp_max - 273)}°C
              </div>
            </div>
            <div className={'flex justify-between'}>
              <div>Humidity:</div>
              <div>{currentWeather.main.humidity}</div>
            </div>
            <div className={'flex justify-between'}>
              <div>Time:</div>
              <div>{convertTZ(currentWeather.dt)}</div>
            </div>
          </div>
        </div>
      )}

      {weatherList && (
        <div
          className={
            'mt-10 z-10 max-w-5xl w-full items-center justify-between font-mono text-sm'
          }
        >
          <h2
            className={'text-xl font-bold pb-3 border-b-2 border-b-black mb-5'}
          >
            Search History
          </h2>
          <div className={'overflow-x-auto'}>
            <table className="w-full">
              <tbody className={'bg-white dark:bg-slate-800'}>
                {!weatherList || weatherList.length < 1 ? (
                  <tr>
                    <td>No Record</td>
                  </tr>
                ) : (
                  weatherList.map((weather: Weather, index: number) => {
                    if (!weather) {
                      return <>No Record</>;
                    }
                    const keyWeather = Object.keys(weather)[0];
                    if (!Object.values(weather)[0]) {
                      return <>No Record</>;
                    }
                    const weatherDetail = Object.values(
                      weather,
                    )[0] as unknown as Weather;
                    return (
                      <tr key={keyWeather}>
                        <td
                          className={
                            'border border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400'
                          }
                        >
                          {index + 1}
                        </td>
                        <td
                          className={
                            'border border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400'
                          }
                        >
                          <div className={'current-location'}>
                            {weatherDetail.name}, {weatherDetail.sys.country}
                          </div>
                        </td>
                        <td
                          className={
                            'border border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400'
                          }
                        >
                          <div className={'current-location'}>
                            {convertTZ(weatherDetail.dt)}
                          </div>
                        </td>
                        <td
                          className={
                            'border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400'
                          }
                        >
                          <div className={'flex'}>
                            <button
                              className={
                                'md:ml-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                              }
                              onClick={() =>
                                handeSearchFromHistory(weatherDetail)
                              }
                            >
                              Search
                            </button>
                            <button
                              className={
                                'ml-5 border border-gray-500 hover:bg-red-700 hover:text-white text-gray font-bold py-2 px-4 rounded'
                              }
                              onClick={() => {
                                removeItem(keyWeather);
                                getStorageData();
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
