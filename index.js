// Used when cookies are declined
var globalNotCookies = {};

// Gets cookies, unless declined then from globalNotCookies
function getCookies() {
    let cookie = {};
    // Tries to parse the cookies, if fails (because empty oder was) stays as {}
    try { cookie = JSON.parse(document.cookie); }
    catch {}
    cookie.allowed ??= false;

    // Use globalNotCookies if not allowed.  Also shallow copy whatever we're using
    cookie = {...(cookie.allowed ? cookie : globalNotCookies)};

    // Replace undefindes with defaults
    cookie.metric ??= false;
    cookie.days ??= 1;
    cookie.temp ??= true;
    cookie.feel ??= false;
    cookie.wind ??= false;
    cookie.precip ??= true;
    cookie.humid ??= false;
    cookie.dewpt ??= false;
    cookie.press ??= false;
    cookie.visib ??= false;
    return cookie;
}

// General update function
function updateState(cookie) {
    // Update cookies or globalNotCookies
    (cookie.allowed ? document.cookie = JSON.stringify(cookie) : globalNotCookies = {...cookie});
    // Update text and visibility of top buttons
    document.getElementById("units").innerText = cookie.metric ? "US Standard" : "Metric";
    cookie.days === 1 ? document.getElementById("1-day").setAttribute("disabled", "") : document.getElementById("1-day").removeAttribute("disabled");
    cookie.days === 3 ? document.getElementById("3-day").setAttribute("disabled", "") : document.getElementById("3-day").removeAttribute("disabled");
    cookie.days === 7 ? document.getElementById("7-day").setAttribute("disabled", "") : document.getElementById("7-day").removeAttribute("disabled");

    // Draw all of the graphs and summary data
    allData();
}

function askCookies(cookies) {
    cookies.allowed = confirm("Allow cookies?");
}

// Run on page load, check about cookies, sets the state
function pageLoad() {
    const cookies = getCookies();
    if (!cookies.allowed) askCookies(cookies);
    updateState(cookies);
}

// Run on click, changes the number of days' data to display
function changeDays(count) {
    const cookie = getCookies();
    cookie.days = count;
    updateState(cookie);
}

// Toggles the setting of what
function toggle(what) {
    const cookie = getCookies();
    cookie.hasOwnProperty(what) && (cookie[what] = !cookie[what]);
    updateState(cookie);
}

// General method for making a graph
function graph(series, chartName, ymin, ymax, yAxisIDs) {
    const cookies = getCookies();
    let date = nDaysAgoMidnight(cookies.days);

    yAxisIDs ??= ["y"];

    return new Chart(chartName, {
        type: "scatter",
        data: {
            datasets: series.map((v) => ({
                ...v,
                fill: false,
                lineTension: cookies.days/10,
                showLine: true,
                pointRadius: 0
            }))
        },
        options: {
            legend: {position: "bottom"},
            scales: {
                yAxes: [
                    {
                        "id" : "y",
                        type: "linear",
                        ticks: {min: ymin, max: ymax}
                    },
                    {
                        "id" : "y2",
                        type: "linear",
                        position: "right",
                        ticks: {},
                    }
                ].filter((v) => (yAxisIDs.includes(v.id))),
                xAxes: [{ticks: {min: decimalDate(date)/* , max: Math.max(...xs) */}}],
            }
        }
    });      
}

// Creates all of the graphs and summary data
async function allData() {
    const data = await getData();

    tempGraph(data.datapoints);
    countGraph(data.datapoints);
    reltvGraph(data.datapoints);

    summaryData(data.dailies, data.datapoints);
}

// Makes the first graph
function tempGraph(data) {
    const cookies = getCookies();

    let series = [];
    cookies.temp && series.push({
        label: `Temperature (°${cookies.metric ? "C" : "F"})`,
        data: data.map((v) => ({x: decimalDate(v.time), y: cookies.metric ? v.temp : C2F(v.temp)})),
        borderColor: "#d5202a"
    });
    cookies.feel && series.push({
        label: `Feels Like (°${cookies.metric ? "C" : "F"})`,
        data: data.map((v) => ({x: decimalDate(v.time), y: cookies.metric ? v.feel : C2F(v.feel)})),
        borderColor: "#ac54a0"
    });
    cookies.dewpt && series.push({
        label: `Dew Point (°${cookies.metric ? "C" : "F"})`,
        data: data.map((v) => ({x: decimalDate(v.time), y: cookies.metric ? v.dewPt : C2F(v.dewPt)})),
        borderColor: "#5b9f49"
    });

    graph(series, "temp-graph")
}

// Makes the second graph
function countGraph(data) {
    const cookies = getCookies();

    let series = [];
    cookies.wind && series.push({
        label: `Wind Speed (${cookies.metric ? "km/hr" : "mi/hr"})`,
        data: data.map((v) => ({x: decimalDate(v.time), y: cookies.metric ? v.wind : K2M(v.wind)})),
        borderColor: "#0053ae"
    });
    cookies.precip && series.push({
        label: `Precipitation (${cookies.metric ? "mm" : "in/10"})`,
        data: data.map((v) => ({x: decimalDate(v.time), y: cookies.metric ? v.precip : mm2in(v.precip)*10})),
        borderColor: "#15aadc"
    });
    cookies.visib && series.push({
        label: `Visibility (${cookies.metric ? "km" : "mi"})`,
        data: data.map((v) => ({x: decimalDate(v.time), y: cookies.metric ? v.visib : K2M(v.visib)})),
        borderColor: "#a3a3a3"
    });

    graph(series, "count-graph", 0)
}

// Makes the third graph
function reltvGraph(data) {
    const cookies = getCookies();

    let series = [];
    cookies.humid && series.push({
        label: `Humidity (%)`,
        data: data.map((v) => ({x: decimalDate(v.time), y: v.humid})),
        borderColor: "#87c404",
        yAxisID: "y"
    });
    cookies.press && series.push({
        label: `Pressure (Millibar)`,
        data: data.map((v) => ({x: decimalDate(v.time), y: v.press})),
        borderColor: "#1e2023",
        yAxisID: "y2"
    });

    graph(series, "reltv-graph", 0,100, series.map((v) => (v.yAxisID)))
}

function summaryData(dailies, datapoints) {
    const cookies = getCookies();

    let up = 0;
    let down = 0;
    let min = datapoints[24].temp;
    let max = datapoints[24].temp;
    for (let i = 1; i < datapoints.length; i++) {
        if (datapoints[i].time > nDaysAgoMidnight(0) || datapoints[i].time < nDaysAgoMidnight(cookies.days)) continue;
        datapoints[i].temp > datapoints[i-1].temp ?
            up   += datapoints[i].temp - datapoints[i-1].temp
        :   down += datapoints[i-1].temp - datapoints[i].temp;
        min = Math.min(min, datapoints[i].temp);
        max = Math.max(max, datapoints[i].temp);
    }
    document.getElementById("glP").innerText = (cookies.metric ? `${rnd(up)}/${rnd(down)} °C` : `${rnd(C2F(up))}/${rnd(C2F(down))} °F`);
    document.getElementById("mmP").innerText = (cookies.metric ? `${rnd(min)}/${rnd(max)} °C` : `${rnd(C2F(min))}/${rnd(C2F(max))} °F`);

    up = 0;
    down = 0;
    min = datapoints[0].temp;
    max = datapoints[0].temp;
    for (let i = 1; i < datapoints.length; i++) {
        if (new Date() - datapoints[i].time > 1000*60*60*24) break;
        datapoints[i].temp > datapoints[i-1].temp ?
            up   += datapoints[i].temp - datapoints[i-1].temp
        :   down += datapoints[i-1].temp - datapoints[i].temp;
        min = Math.min(min, datapoints[i].temp);
        max = Math.max(max, datapoints[i].temp);
    }
    document.getElementById("gl24").innerText = (cookies.metric ? `${rnd(up)}/${rnd(down)} °C` : `${rnd(C2F(up))}/${rnd(C2F(down))} °F`);
    document.getElementById("mm24").innerText = (cookies.metric ? `${rnd(min)}/${rnd(max)} °C` : `${rnd(C2F(min))}/${rnd(C2F(max))} °F`);

    console.log(dailies)
}

// Gets the date for midnight n days ago
function nDaysAgoMidnight(n) {
    let date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    date.setDate(date.getDate() - n);
    return date;
}

// Gets the decimal days since midnight from millis dates
function decimalDate(datenum) {
    const date = new Date(datenum - midnight());
    return (
        date.getDate() +
        date.getHours() / 24 +
        date.getMinutes() / 1440
    ) - 31;
}

// Gets millis date of next UTC midnight
function midnight() {
    let date = new Date();
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    date.setUTCDate(date.getUTCDate() + 1);
    return +date;
}

// Converts Centigrade to Fahrenheit
function C2F(val) {
    return val * 1.8 + 32;
}

// Converts clicks to miles
function K2M(val) {
    return val * 0.621;
}

// Converts millimetres to inches
function mm2in(val) {
    return val / 25.4;
}

// Rounds to two decimals
function rnd(val) {
    return Math.round(val * 100) / 100;
}
