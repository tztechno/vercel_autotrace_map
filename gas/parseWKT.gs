// WKTをGeoJSONの座標配列に変換する関数, 不要
function parseWKT(wkt) {
  Logger.log("Parsing WKT: " + wkt);

  // "POINT(" または "POINT (" の部分を取り除き、座標部分を取得
  const coordsStr = wkt.replace(/POINT\s*\(/, '').replace(')', '').trim();

  // 座標の緯度と経度を数値に変換
  const [lng, lat] = coordsStr.split(' ').map(Number);

  if (isNaN(lng) || isNaN(lat)) {
    throw new Error("Invalid coordinates: " + coordsStr);
  }

  // GeoJSON形式で座標を返す
  return [lng, lat];
}
