<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Map with Geolocation and Multiple Dropdown Filters</title>
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

        button,
        select {
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
    <button onclick="stopTracking()" aria-label="Stop tracking location">Stop Tracking</button>
    <button onclick="getPoints()" aria-label="Get all location points">Get Points</button>
    <select id="nameFilter" onchange="filterPoints()" aria-label="Filter points by name">
        <option value="">すべての名前</option>
    </select>
    <select id="dateFilter" onchange="filterPoints()" aria-label="Filter points by date">
        <option value="">すべての日付</option>
    </select>
    <select id="hourFilter" onchange="filterPoints()" aria-label="Filter points by hour">
        <option value="">すべての時間</option>
    </select>
</div>

    <div id="loadingMessage">処理中...</div>
    <div id="position_view"></div>

    <div id="loadingMessage">処理中...</div>
    <div id="position_view"></div>

    <script>
            var num = 0;
            var watch_id;
            var lat0 = 35.6895;
            var lon0 = 139.6917;
            var map;
            var currentMarker;
            var geojsonLayer;

            //getdata.gs バージョン 11（2024/08/28 12:28）
            var webAppUrl2 = 'https://script.google.com/macros/s/AKfycbwcXKwllkTf-00nT_KCeXK4KccPfJff8Uk8lmrM4h44lz3hTb_08UuSKo4Z0iiXGydONg/exec'

            function startTracking() {
                watch_id = navigator.geolocation.watchPosition(
                    updatePosition,
                    handleLocationError,
                    { "enableHighAccuracy": true, "timeout": 20000, "maximumAge": 5000 }
                );
            }

            function stopTracking() {
                if (watch_id) {
                    navigator.geolocation.clearWatch(watch_id);
                    watch_id = null;
                }
            }

            function handleLocationError(error) {
                console.log("Error code:", error.code);  // エラーメッセージをコンソールに出力

                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "位置情報の利用が許可されていません。";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "位置情報が取得できません。";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "位置情報の取得がタイムアウトしました。";
                        break;
                    default:
                        errorMessage = "位置情報の取得中にエラーが発生しました。";
                }
                alert(errorMessage);
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

                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                currentMarker = L.marker([lat0, lon0]).addTo(map)
                    .bindPopup("<b>HERE!</b>")
                    .openPopup();
            }


            function getPoints() {
                document.getElementById('loadingMessage').style.display = 'block';

                fetch(webAppUrl2)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("Received raw data:", JSON.stringify(data, null, 2));

                        // GeoJSONの形式を修正
                        let features = data.features.map(feature => {
                            console.log("Processing feature:", feature);
                            return {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: feature.geometry
                                },
                                properties: feature.properties
                            };
                        });

                        let geojsonData = {
                            type: 'FeatureCollection',
                            features: features
                        };

                        console.log("Processed GeoJSON data:", JSON.stringify(geojsonData, null, 2));

                        if (geojsonLayer) {
                            map.removeLayer(geojsonLayer);
                        }

                        geojsonLayer = L.geoJSON(geojsonData, {
                            onEachFeature: function (feature, layer) {
                                if (feature.properties) {
                                    let popupContent = '';
                                    for (let key in feature.properties) {
                                        popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                                    }
                                    layer.bindPopup(popupContent);
                                }
                            }
                        }).addTo(map);

                        if (geojsonLayer.getLayers().length > 0) {
                            map.fitBounds(geojsonLayer.getBounds());
                        } else {
                            console.warn('No valid features to display');
                        }

                        document.getElementById('loadingMessage').style.display = 'none';

                        // フィルターを更新
                        updateFilters(geojsonData);
                    })
                    .catch(error => {
                        console.error('Error processing the data:', error);
                        document.getElementById('loadingMessage').style.display = 'none';
                        alert('データの処理中にエラーが発生しました。データ形式を確認してください。');
                    });
            }
                document.getElementById('loadingMessage').style.display = 'block';

                fetch(webAppUrl2)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("Received raw data:", data);

                        // GeoJSONの形式を修正
                        let features = data.features.map(feature => {
                            return {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: feature.geometry
                                },
                                properties: feature.properties
                            };
                        });

                        let geojsonData = {
                            type: 'FeatureCollection',
                            features: features
                        };

                        console.log("Processed GeoJSON data:", geojsonData);

                        if (geojsonLayer) {
                            map.removeLayer(geojsonLayer);
                        }

                        geojsonLayer = L.geoJSON(geojsonData, {
                            onEachFeature: function (feature, layer) {
                                if (feature.properties) {
                                    let popupContent = '';
                                    for (let key in feature.properties) {
                                        popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                                    }
                                    layer.bindPopup(popupContent);
                                }
                            }
                        }).addTo(map);

                        if (geojsonLayer.getLayers().length > 0) {
                            map.fitBounds(geojsonLayer.getBounds());
                        } else {
                            console.warn('No valid features to display');
                        }

                        document.getElementById('loadingMessage').style.display = 'none';

                        // フィルターを更新
                        updateFilters(geojsonData);
                    })
                    .catch(error => {
                        console.error('Error processing the data:', error);
                        document.getElementById('loadingMessage').style.display = 'none';
                        alert('データの処理中にエラーが発生しました。データ形式を確認してください。');
                    });


            function updateFilters(data) {
        console.log("Entering updateFilters with data:", JSON.stringify(data, null, 2));

        const nameFilter = document.getElementById('nameFilter');
        const dateFilter = document.getElementById('dateFilter');
        const hourFilter = document.getElementById('hourFilter');
        const names = new Set();
        const dates = new Set();
        const hours = new Set();

        if (data && data.features && Array.isArray(data.features)) {
            data.features.forEach(feature => {
                console.log("Processing feature for filters:", feature);
                if (feature.properties) {
                    if (feature.properties.name) {
                        names.add(feature.properties.name);
                    }
                    if (feature.properties.date) {
                        dates.add(feature.properties.date);
                    }
                    if (feature.properties.hour) {
                        hours.add(feature.properties.hour);
                    }
                }
            });
        } else {
            console.error("Invalid data structure for updating filters");
        }

        console.log("Unique names:", Array.from(names));
        console.log("Unique dates:", Array.from(dates));
        console.log("Unique hours:", Array.from(hours));

        updateFilterOptions(nameFilter, names, "すべての名前");
        updateFilterOptions(dateFilter, dates, "すべての日付");
        updateFilterOptions(hourFilter, hours, "すべての時間");
    }


            function updateFilterOptions(selectElement, optionsSet, allText) {
        console.log(`Updating ${selectElement.id} with options:`, Array.from(optionsSet));

        if (!selectElement) {
            console.error(`Element not found: ${selectElement.id}`);
            return;
        }

        selectElement.innerHTML = `<option value="">${allText}</option>`;
        Array.from(optionsSet).sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });

        console.log(`${selectElement.id} updated, new innerHTML:`, selectElement.innerHTML);
    }


            function filterPoints() {
                const selectedName = document.getElementById('nameFilter').value;
                const selectedDate = document.getElementById('dateFilter').value;
                const selectedHour = document.getElementById('hourFilter').value;

                if (geojsonLayer) {
                    geojsonLayer.eachLayer(layer => {
                        const properties = layer.feature.properties;
                        const nameMatch = selectedName === '' || (properties && properties.name === selectedName);
                        const dateMatch = selectedDate === '' || (properties && properties.date === selectedDate);
                        const hourMatch = selectedHour === '' || (properties && properties.hour === selectedHour);

                        if (nameMatch && dateMatch && hourMatch) {
                            layer.addTo(map);
                        } else {
                            map.removeLayer(layer);
                        }
                    });
                }
            }


            document.addEventListener("DOMContentLoaded", function () {
                startTracking();
            });


    </script>
</body>

</html>