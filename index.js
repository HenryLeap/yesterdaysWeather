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
    cookie.sun ??= true;
    cookie.moon ??= false;
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

    // Draw all of the graphs
    allGraphs();
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
function graph(series, chartName) {
    const cookies = getCookies();
    let date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    date.setDate(date.getDate() - cookies.days);

    return new Chart(chartName, {
        type: "scatter",
        data: {
            datasets: series.map((v) => ({
                ...v,
                fill: false,
                lineTension: .3,
                showLine: true,
                pointRadius: 0
            }))
        },
        options: {
            legend: {position: "bottom"},
            scales: {
                // yAxes: [{ticks: {min: Math.min(...ys), max: Math.max(...ys)}}],
                xAxes: [{ticks: {min: decimalDate(date)/* , max: Math.max(...xs) */}}],
            }
        }
    });      
}

// Creates all of the graphs
async function allGraphs() {
    const data = await getData();

    tempGraph(data.datapoints);
}

// Makes the first graph
function tempGraph(data) {
    const cookie = getCookies();

    let series = [];
    cookie.temp && series.push({
        label: "Temperature",
        data: data.map((v) => ({x: decimalDate(v.time), y: v.temp})),
        borderColor: "#d5202a"
    });
    // cookie.feel && series.push({
    //     label: "Feels Like",
    //     data: data.map((v) => ({x: decimalDate(v.time), y: v.feel}))
    // borderColor: "#ac54a0"
    // });
    cookie.dewpt && series.push({
        label: "Dew Point",
        data: data.map((v) => ({x: decimalDate(v.time), y: v.dewPt})),
        borderColor: "#5b9f49"
    });

    graph(series, "temp-graph")
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
