var SPREADSHEET_ID = '1XUfCuOhUefXCQbYm4RsWBs4fTadaFEc74s8nsKJEPpA';

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];

  var row = [
    data['id'] || '',
    data['timestamp'] || '',
    data['Nominator Name'] || '',
    data['Nominator Contact'] || '',
    data['Nominator Affiliation'] || '',
    data['MVP — Nominee Name'] || '',
    data['MVP — House Affiliation'] || '',
    data['MVP — Social Handle'] || '',
    data['Ball of the Year — Ball Name'] || '',
    data['Ball of the Year — Host'] || '',
    data['Mini Ball of the Year — Ball Name'] || '',
    data['Mini Ball of the Year — Host'] || '',
    data['Theme of the Year — Ball + Theme'] || '',
    data['Promotional Rollout of the Year — Ball Name'] || '',
    data['Battle of the Year — Competitors + Ball'] || '',
    data['Battle of the Year — Clip Link'] || '',
    data['Battle of the Year — Clip Upload'] || '',
    data['Effect of the Year — Performer + Ball'] || '',
    data['Effect of the Year — Clip Link'] || '',
    data['Effect of the Year — Clip Upload'] || '',
    data['Clip of the Year — Performer + Description'] || '',
    data['Clip of the Year — Clip Link'] || '',
    data['Clip of the Year — Clip Upload'] || '',
    data['Most Memeable Moment — Description'] || '',
    data['Most Memeable Moment — Clip Link'] || '',
    data['Most Memeable Moment — Clip Upload'] || '',
    data['Judge of the Year — Nominee Name'] || '',
    data['Judge of the Year — House Affiliation'] || '',
    data['Out of Towner of the Year — Nominee Name + City'] || '',
    data['Out of Towner of the Year — Social Handle'] || '',
    data['Leader of the Year MF — Nominee Name'] || '',
    data['Leader of the Year MF — House Affiliation'] || '',
    data['Leader of the Year FF — Nominee Name'] || '',
    data['Leader of the Year FF — House Affiliation'] || '',
    data['Ballroom Impact Award — Nominee Name'] || '',
    data['Ballroom Impact Award — House Affiliation'] || '',
    data['Community Impact Award — Nominee Name'] || '',
    data['Community Impact Award — House Affiliation'] || '',
    data['Supporting Statement'] || '',
    data['Video Key'] || '',
    data['Video Filename'] || ''
  ];

  sheet.appendRow(row);

  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', id: data['id'] })
  ).setMimeType(ContentService.MimeType.JSON);
}
