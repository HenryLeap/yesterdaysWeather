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

function changeUnits() {
    const cookie = getCookies();
    cookie.metric = !cookie.metric;
    updateState(cookie);
}

function changeDays(count) {
    const cookie = getCookies();
    cookie.days = count;
    updateState(cookie);
}
