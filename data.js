
const latitude = 39.6807;
const longitude = -75.7528;


async function getCurrentWeather(prompt,message){
    const url = `https://api.weather.gov/points/${latitude},${longitude}`;
    try{
        const gridFetch = await fetch(url);
        const gridData = await gridFetch.json();

        const forecastUrl = gridData.properties.forecast;
        const forecast = await fetch(forecastUrl);
        
        const forecastData = await forecast.json();

    return forecastData
    }catch(error){
        console.error('Error:', error)
    }

}

async function getOldWeather(prompt,message){
    const url = `https://api.weather.gov/points/${latitude},${longitude}`
    try{
        //turn user's lat/long into grid coordinate
        const gridFetch = await fetch(url)
        const gridData = await gridFetch.json()

        //get the stations near that coordinate
        const stationsUrl = gridData.properties.observationStations
        const stations = await fetch(stationsUrl)
        const stationsData = await stations.json()

        //get closest station (first in the list)
        const stationUrl = stationsData.features[0].id
        
        //unneccessary, gets all data of the station, when all we need is the observations
        /*
        const station = await fetch(stationUrl)
        const stationData = await station.json()
        */
        
        //get all observations of the closest station
        const stationObservationUrl = `${stationUrl}/observations`
        const stationObervation = await fetch(stationObservationUrl)
        const stationObservationData = await stationObervation.json()

        //get recent observations
        const stationObservationDataRecent = stationObservationData.features
        return stationObservationDataRecent;

    }catch(error){
        console.error('Error:', error)
    }
}
 Promise.resolve(getOldWeather()).then(
     body=>console.log(body)
 )

 // Get list of weather data from each observation

async function getData() {
    const raw = await getOldWeather();

    return raw.map((v)=>({
        date: v.id.slice(51,61),
        time: v.id.slice(62,70),
        temp: v.properties.temperature.value,
        heatIndex: v.properties.heatIndex.value,
        precipitation: v.properties.precipitationLastHour.value,
        windSpeed: v.properties.windSpeed.value, 
        windDirection: v.properties.windDirection.value,
        relativeHumidity: v.properties.relativeHumidity.value,
        dewPoint: v.properties.dewpoint.value,
        pressure: v.properties.barometricPressure.value,
        visibility: v.properties.visibility.value,
    }))
    //     datapoints: [
    //         {
    //             time: 0,
    //             temp: 0
    //         }
    //     ]
    // };
}