function getCookies() {
    const cookie = JSON.parse(document.cookie)
    cookie.metric ??= false;
    cookie.days ??= 1;
    cookie.temp ??= true;
    cookie.feel ??= false;
    cookie.wind ??= false;
    cookie.precip ??= true;
    cookie.humid ??= false;
    cookie.dewpt ??= false;
    cookie.sun ??= true;
    cookie.moon ??= false;
    return cookie;
}

function updateState(cookie) {
    document.cookie = JSON.stringify(cookie);
    document.getElementById("units").innerText = cookie.metric ? "US Standard" : "Metric";
}

function pageLoad() {
    updateState(getCookies());
}

function changeUnits() {
    const cookie = getCookies();
    cookie.metric = !cookie.metric;
    updateState(cookie);
}
