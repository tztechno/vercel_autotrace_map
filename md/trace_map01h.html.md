<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Map with Geolocation</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<style>
    body,
    html {
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
    }

    #map {
        flex-grow: 1;
        width: 100%;
    }

    #controls {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.8);
        padding: 5px;
        border-radius: 5px;
    }

    button {
        padding: 5px 10px;
        font-size: 14px;
        margin: 2px;
    }

    #position_view {
        position: absolute;
        bottom: 10px;
        left: 10px;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.8);
        padding: 5px;
        border-radius: 5px;
        font-size: 12px;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    #loadingMessage {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2000;
        background-color: rgba(255, 255, 0, 0.8);
        padding: 10px;
        border-radius: 5px;
    }
</style>

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@IshiiStpete" />
    <meta name="twitter:title" content="I'M HERE! HELP!">
    <meta name="twitter:image" content="https://raw.githubusercontent.com/tztechno/vercel_map/main/here.png">
</head>

<body>
    <div id="map"></div>
    <div id="controls">
        <button onclick="stopTracking()">Stop Tracking</button>
        <button onclick="sendLocationToGAS()">Send Location</button>
        <input type="text" id="username" placeholder="Enter your name" />
    </div>
    <div id="position_view"></div>
    <div id="loadingMessage">Processing...</div>

<script>
    var num = 0;
    var watch_id;
    var lat0 = 35.6895;
    var lon0 = 139.6917;
    var map;
    var currentMarker;

    function test() {
        watch_id = navigator.geolocation.watchPosition(updatePosition, function (e) { alert(e.message); }, { "enableHighAccuracy": true, "timeout": 20000, "maximumAge": 2000 });
    }

    function stopTracking() {
        if (watch_id) {
            navigator.geolocation.clearWatch(watch_id);
            watch_id = null;
        }
    }

    function updatePosition(position) {
        lat0 = position.coords.latitude;
        lon0 = position.coords.longitude;

        var geo_text = `緯度: ${lat0.toFixed(6)}, 経度: ${lon0.toFixed(6)}`;
        document.getElementById('position_view').innerText = geo_text;

        if (!map) {
            map = L.map('map').setView([lat0, lon0], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        } else {
            map.setView([lat0, lon0]);
        }

        // 以前のマーカーが存在する場合は削除する
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // 新しいマーカーを追加し、currentMarkerに保存
        currentMarker = L.marker([lat0, lon0]).addTo(map)
            .bindPopup("<b>HERE!</b>")
            .openPopup();

        // 追加の位置情報の表示
        var geo_details = `緯度:${lat0}\n経度:${lon0}\n高度:${position.coords.altitude}\n位置精度:${position.coords.accuracy}\n高度精度:${position.coords.altitudeAccuracy}\n移動方向:${position.coords.heading}\n速度:${position.coords.speed}\n取得時刻:${new Date(position.timestamp).toLocaleString()}\n取得回数:${++num}\n`;

        document.getElementById('position_view').innerHTML = geo_details;
    }

    function sendLocationToGAS() {
        var time = new Date().toISOString();
        var wkt = `POINT(${lon0} ${lat0})`;
        var name = document.getElementById('username').value;

        if (!name) {
            alert('Please enter your name before sending your location.');
            return;
        }

        var data = {
            wkt: wkt,
            time: time,
            name: name
        };

        fetch('https://script.google.com/macros/s/AKfycbyeRoHRj0wLOvM6bYzl3leJzvxcrKrspkPTvt2PdNmXBQbYQoQ5Sf0PxwFyfZL2wejQ/exec', {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            body: JSON.stringify(data)
        }).then(response => {
            console.log('Location sent successfully');
            alert('Location sent successfully');
        }).catch(error => {
            console.error('Error:', error);
            alert('Error sending location');
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        test();
    });
</script>


</body>

</html>