async function getCurrentWeather(prompt,message){
    const url = 'https://api.weather.gov/points/39.6807,-75.7528';
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
    const url = 'https://api.weather.gov/points/39.6807,-75.7528'
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

        //get most recent observation
        const stationObservationDataMostRecent = stationObservationData.features[0]
        return stationObservationDataMostRecent;

    }catch(error){
        console.error('Error:', error)
    }
}
Promise.resolve(getOldWeather()).then(
    body=>console.log(body)
)