function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const wkt = data.wkt;
  const time = data.time;
  const name = data.name;
  
  // Extract date and hour from the time string
  const date = time.substring(0,10);  // YYYY-MM-DD
  const hour = time.substring(11,13); // HH

  // スプレッドシートのIDを指定（実際のスプレッドシートIDに置き換えてください）
  const spreadsheetId = '1Os-N4gdXB8ID3phfekUz6WRZeDyhGIAZX4DGTjBf3tU';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();

  // データを配列として準備（dateとhourを追加）
  const rowData = [wkt, time, name, date, hour];

  // シートの最終行の次の行にデータを追加
  sheet.appendRow(rowData);

  return ContentService.createTextOutput("Data saved successfully");
}