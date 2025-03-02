
var latitude = 39.6807;
var longitude = -75.7528;


function getLocation() {
    navigator.geolocation.getCurrentPosition(successFunction);
    function successFunction(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log(`Your latitude is ${latitude} and longitude is ${longitude}`);
    }
}
getLocation();




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
    //Returns array of observations of the weather
    //Each observation is a messy object, the data is in a properties field

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
        const stationObservationsUrl = `${stationUrl}/observations`
        const stationObervations = await fetch(stationObservationsUrl)
        const stationObservationsData = await stationObervations.json()

        //get recent observations
        const stationObservationsDataList = stationObservationsData.features
        return stationObservationsDataList;

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
        time: Date.parse(v.id.slice(51,76)),
        temp: v.properties.temperature.value,
        heatIndex: v.properties.heatIndex.value,
        precip: v.properties.precipitationLastHour.value,
        wind: v.properties.windSpeed.value, 
        windDirection: v.properties.windDirection.value,
        humid: v.properties.relativeHumidity.value,
        dewPt: v.properties.dewpoint.value,
        press: v.properties.barometricPressure.value,
        visib: v.properties.visibility.value,
    }))
}

//async function getDaily() {

//}

