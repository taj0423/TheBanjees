import crypto from 'node:crypto';

// Helper to base64UrlEncode strings/objects
function base64UrlEncode(str) {
  const buf = typeof str === 'string' ? Buffer.from(str) : Buffer.from(JSON.stringify(str));
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Generate JWT for Google API OAuth
function generateJWT(email, privateKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

// Fetch access token using Service Account credentials
async function getGoogleAccessToken(email, privateKey) {
  const jwt = generateJWT(email, privateKey.replace(/\\n/g, '\n'));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  if (!res.ok) {
    throw new Error(`Google OAuth token retrieval failed: ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

// Append row of values to sheet
async function appendToGoogleSheet(accessToken, spreadsheetId, range, values) {
  const url = `https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [values] })
  });
  if (!res.ok) {
    throw new Error(`Google Sheets append failed: ${await res.text()}`);
  }
  return await res.json();
}

// Main integration function called from the serverless handler
export async function sendToGoogleSheets(id, answers, videoInfo) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1XUfCuOhUefXCQbYm4RsWBs4fTadaFEc74s8nsKJEPpA';
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A1';

  if (!email || !privateKey || !spreadsheetId) {
    console.warn(
      'Google Sheets integration is enabled but credentials are not fully configured.\n' +
      'Required env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SPREADSHEET_ID\n' +
      'Data will not be saved to Google Sheets.'
    );
    return false;
  }

  try {
    const accessToken = await getGoogleAccessToken(email, privateKey);
    
    // Map form answers into a flat aligned array matching Sheet headers
    const row = [
      id,
      new Date().toISOString(),
      answers["Nominator Name"] || "",
      answers["Nominator Contact"] || "",
      answers["Nominator Affiliation"] || "",
      answers["MVP — Nominee Name"] || "",
      answers["MVP — House Affiliation"] || "",
      answers["MVP — Social Handle"] || "",
      answers["Ball of the Year — Ball Name"] || "",
      answers["Ball of the Year — Host"] || "",
      answers["Mini Ball of the Year — Ball Name"] || "",
      answers["Mini Ball of the Year — Host"] || "",
      answers["Theme of the Year — Ball + Theme"] || "",
      answers["Promotional Rollout of the Year — Ball Name"] || "",
      answers["Battle of the Year — Competitors + Ball"] || "",
      answers["Battle of the Year — Clip Link"] || "",
      answers["Battle of the Year — Clip Upload"] || "",
      answers["Effect of the Year — Performer + Ball"] || "",
      answers["Effect of the Year — Clip Link"] || "",
      answers["Effect of the Year — Clip Upload"] || "",
      answers["Clip of the Year — Performer + Description"] || "",
      answers["Clip of the Year — Clip Link"] || "",
      answers["Clip of the Year — Clip Upload"] || "",
      answers["Most Memeable Moment — Description"] || "",
      answers["Most Memeable Moment — Clip Link"] || "",
      answers["Most Memeable Moment — Clip Upload"] || "",
      answers["Judge of the Year — Nominee Name"] || "",
      answers["Judge of the Year — House Affiliation"] || "",
      answers["Out of Towner of the Year — Nominee Name + City"] || "",
      answers["Out of Towner of the Year — Social Handle"] || "",
      answers["Leader of the Year MF — Nominee Name"] || "",
      answers["Leader of the Year MF — House Affiliation"] || "",
      answers["Leader of the Year FF — Nominee Name"] || "",
      answers["Leader of the Year FF — House Affiliation"] || "",
      answers["Ballroom Impact Award — Nominee Name"] || "",
      answers["Ballroom Impact Award — House Affiliation"] || "",
      answers["Community Impact Award — Nominee Name"] || "",
      answers["Community Impact Award — House Affiliation"] || "",
      answers["Supporting Statement"] || "",
      videoInfo.key || "",
      videoInfo.filename || ""
    ];

    await appendToGoogleSheet(accessToken, spreadsheetId, range, row);
    console.log(`Successfully appended nomination ${id} to Google Sheets spreadsheet ${spreadsheetId}`);
    return true;
  } catch (err) {
    console.error(`Error sending nomination data to Google Sheets:`, err.message || err);
    return false;
  }
}
