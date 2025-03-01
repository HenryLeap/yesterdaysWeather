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

function myGraph() {
    return graph(
        [50,60,70,80,90,100,110,120,130,140,150],
        [7,8,8,9,9,9,10,11,14,14,15],
        "temp-graph", "#d5202a"
    )
}

function graph(xs, ys, name, colour) {
    return new Chart(name, {
        type: "scatter",
        data: {
            datasets: [{
                fill: false,
                lineTension: .3,
                showLine: true,
                pointRadius: 0,
                borderColor: colour,
                data: xs.map((v, i) => ({x:v, y:ys[i]}))
            }]
        },
        options: {
            legend: {display: false},
            scales: {
                yAxes: [{ticks: {min: 6, max: 16}}],
                xAxes: [{ticks: {min: 50, max: 150}}]
            }
        }
    });      
}
