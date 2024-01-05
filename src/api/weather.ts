
export const getCoordinatesByLocationName = async (cityName: string, countryCode?: string, stateCode?: string, limit?: number) => {
    try {
        const res = await fetch(
            `${process.env.WEATHER_URL}/geo/1.0/direct?q='${cityName},${stateCode ?? ''},${countryCode ?? ''}&limit=${limit ?? 1}&appid=${process.env.WEATHER_API}`
        );
        const data = await res.json();
        return data[0]
    } catch (err) {
        console.log(err);
        return { isError: true};
    }
};

export const getCurrentWeather = async (lat: string, lon?: string) => {
    try {
        const res = await fetch(
            `${process.env.WEATHER_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API}`
        );
        return await res.json()
    } catch (err) {
        console.log(err);
        return { isError: true};
    }
};