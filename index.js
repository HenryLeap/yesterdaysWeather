var globalNotCookies = {};

function getCookies() {
    let cookie = {};
    try {
        cookie = JSON.parse(document.cookie);
    }
    catch {}
    cookie.allowed ??= false;

    cookie = {...(cookie.allowed ? cookie : globalNotCookies)};

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

function updateState(cookie) {
    (cookie.allowed ? document.cookie  = JSON.stringify(cookie): globalNotCookies = {...cookie});
    document.getElementById("units").innerText = cookie.metric ? "US Standard" : "Metric";
    cookie.days === 1 ? document.getElementById("1-day").setAttribute("disabled", "") : document.getElementById("1-day").removeAttribute("disabled");
    cookie.days === 3 ? document.getElementById("3-day").setAttribute("disabled", "") : document.getElementById("3-day").removeAttribute("disabled");
    cookie.days === 7 ? document.getElementById("7-day").setAttribute("disabled", "") : document.getElementById("7-day").removeAttribute("disabled");
    allGraphs(cookie);
}

function askCookies(cookies) {
    cookies.allowed = confirm("Allow cookies?");
}

function pageLoad() {
    const cookies = getCookies();
    if (!cookies.allowed) askCookies(cookies);
    updateState(cookies);
}

// function changeUnits() {
//     const cookie = getCookies();
//     cookie.metric = !cookie.metric;
//     updateState(cookie);
// }

function changeDays(count) {
    const cookie = getCookies();
    cookie.days = count;
    updateState(cookie);
}

function toggle(what) {
    const cookie = getCookies();
    cookie.hasOwnProperty(what) && (cookie[what] = !cookie[what]);
    updateState(cookie);
}

function graph(series, chartName) {
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
            // [{
            //     label: seriesName,
            //     fill: false,
            //     lineTension: .3,
            //     showLine: true,
            //     pointRadius: 0,
            //     borderColor: colour,
            //     data: xs.map((v, i) => ({x:v, y:ys[i]}))
            // }]
        },
        options: {
            legend: {position: "bottom"},
            scales: {
                // yAxes: [{ticks: {min: Math.min(...ys), max: Math.max(...ys)}}],
                // xAxes: [{ticks: {min: Math.min(...xs), max: Math.max(...xs)}}],
            }
        }
    });      
}

async function allGraphs(cookie) {
    const data = await getData();

    tempGraph(data);
}

function tempGraph(data) {
    const cookie = getCookies();

    let series = [];
    cookie.temp && series.push({
        label: "Temperature",
        data: data.map((v, i) => ({x: i, y: v.temp})),
        borderColor: "#d5202a"
    });
    // cookie.feel && series.push({
    //     label: "Feels Like",
    //     data: data.map((v, i) => ({x: i, y: v.feel}))
    // borderColor: "#ac54a0"
    // });
    cookie.dewpt && series.push({
        label: "Dew Point",
        data: data.map((v, i) => ({x: i, y: v.dewPoint})),
        borderColor: "#5b9f49"
    });

    graph(series, "temp-graph")
}
