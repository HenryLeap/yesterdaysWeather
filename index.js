var metric = false;

function changeUnits() {
    metric = !metric;
    document.getElementById("units").innerText = metric ? "US Standard" : "Metric";
}