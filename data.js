
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
// getLocation();




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

async function getAllWeather(prompt,message){
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
// Promise.resolve(getAllWeather()).then(
//     body=>console.log(body)
// )


// Get list of weather data from each observation

async function getData() {
    //returns ALLLLL the data we want from the observations (Plural!)
    
    //gets the weather from (roughly) the past week
    //needs to be in the function call so we don't lose it
    const raw = await getAllWeather();
    
    //empty array for the observations which are near midnight
    let dailyObservations = [raw[0]];
    
    //this section is for getting daily stuff (of which we have only two)
    //set currentDay as today
    //grab the first observation in the array which doesn't have the same day as previous
    //add it to newObservations, change currentDay to its day
    let currentDay = Date().slice(8,10);
    for(let i=0;i<raw.length;i++){
        if(currentDay!==raw[i].id.slice(59,61)){
            dailyObservations.push(raw[i]);
            currentDay=raw[i].id.slice(59,61);
        }
    };

    //datapoints points. some names have been changed,
    //but otherwise mostly untouched from Michael's work
    const datapoints = raw.map((v) => ({
        time:   Date.parse(v.id.slice(51,76)),
        temp:   parseFloat(v.properties.temperature.value),
        // heatIndex: parseFloat(v.properties.heatIndex.value),
        precip: parseFloat(v.properties.precipitationLastHour.value),
        wind:   parseFloat(v.properties.windSpeed.value), 
        // windDirection: parseFloat(v.properties.windDirection.value),
        humid:  parseFloat(v.properties.relativeHumidity.value),
        dewPt:  parseFloat(v.properties.dewpoint.value),
        press:  parseFloat(v.properties.barometricPressure.value) / 100,
        visib:  parseFloat(v.properties.visibility.value) / 1000,
    })).map((v) => ({
        ...v,
        feel: apparentTemp(v.temp, v.humid, v.wind)
    }));

    //dailies values. maps from newObservations, gets just highs and lows
    //we COULD do precipitation, but it's in 6 hour segments, so we'd need to make another observations array
    const dailies = dailyObservations.map((v) => ({
        high: v.properties.maxTemperatureLast24Hours,
        low:  v.properties.minTemperatureLast24Hours,
    }));

    return {
        datapoints,
        dailies
    }
}

// Get the apparent temperature given dry bulb, humidity, and wind speed
// https://code.adonline.id.au/calculating-feels-like-temperatures/
function apparentTemp(temp, humid, wind) {
    const rho = humid/100 * 6.105 * Math.exp(17.27 * temp / (237.7+temp));
    return temp + 0.33*rho - 0.7*wind - 4;
}
