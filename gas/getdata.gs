function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var features = [];

  //console.log("Headers: ", headers); // Headersをログに出力
  //console.log("Data: ", data); // 全データをログに出力

  for (var i = 1; i < data.length; i++) {
    var feature = {
      type: "Feature",
      geometry: null,
      properties: {}
    };

    //console.log("Processing row: ", data[i]); // 現在処理中の行をログに出力

    for (var j = 0; j < headers.length; j++) {
      if (headers[j] === "WKT") {
        var wkt = data[i][j];
        feature.geometry = parseWKT(wkt);
        //console.log("Parsed WKT: ", wkt, "Geometry: ", feature.geometry); // WKTと解析結果をログに出力
      } else if (headers[j] === "date") {
        var timeString = data[i][j];

        // timeStringをDateオブジェクトに変換
        var dateObj = new Date(timeString);

        // 年、月、日を取り出してフォーマットを整える
        var year = dateObj.getFullYear();
        var month = ("0" + (dateObj.getMonth() + 1)).slice(-2); // 月を2桁にする
        var day = ("0" + dateObj.getDate()).slice(-2); // 日を2桁にする

        // YYYY-MM-DD形式の文字列を作成
        var formattedDate = year + "-" + month + "-" + day;
        feature.properties["date"] = formattedDate;
      } else if (headers[j] === "hour") {
          feature.properties["hour"] = data[i][j];
      } else {
        feature.properties[headers[j]] = data[i][j];
        //console.log("Property: ", headers[j], "Value: ", data[i][j]); // 他のプロパティをログに出力
      }
    }

    features.push(feature);
    console.log("Feature added: ", feature); // 追加したFeatureをログに出力
  }

  var geoJson = {
    type: "FeatureCollection",
    features: features
  };

  return ContentService.createTextOutput(JSON.stringify(geoJson)).setMimeType(ContentService.MimeType.JSON);
}

