export async function sendToGoogleSheets(id, answers, videoInfo) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.warn(
      'Google Sheets integration is enabled but GOOGLE_APPS_SCRIPT_URL is not configured.\n' +
      'Data will not be saved to Google Sheets.'
    );
    return false;
  }

  try {
    const payload = {
      id,
      timestamp: new Date().toISOString(),
      "Nominator Name": answers["Nominator Name"] || "",
      "Nominator Contact": answers["Nominator Contact"] || "",
      "Nominator Affiliation": answers["Nominator Affiliation"] || "",
      "MVP — Nominee Name": answers["MVP — Nominee Name"] || "",
      "MVP — House Affiliation": answers["MVP — House Affiliation"] || "",
      "MVP — Social Handle": answers["MVP — Social Handle"] || "",
      "Ball of the Year — Ball Name": answers["Ball of the Year — Ball Name"] || "",
      "Ball of the Year — Host": answers["Ball of the Year — Host"] || "",
      "Mini Ball of the Year — Ball Name": answers["Mini Ball of the Year — Ball Name"] || "",
      "Mini Ball of the Year — Host": answers["Mini Ball of the Year — Host"] || "",
      "Theme of the Year — Ball + Theme": answers["Theme of the Year — Ball + Theme"] || "",
      "Promotional Rollout of the Year — Ball Name": answers["Promotional Rollout of the Year — Ball Name"] || "",
      "Battle of the Year — Competitors + Ball": answers["Battle of the Year — Competitors + Ball"] || "",
      "Battle of the Year — Clip Link": answers["Battle of the Year — Clip Link"] || "",
      "Battle of the Year — Clip Upload": answers["Battle of the Year — Clip Upload"] || "",
      "Effect of the Year — Performer + Ball": answers["Effect of the Year — Performer + Ball"] || "",
      "Effect of the Year — Clip Link": answers["Effect of the Year — Clip Link"] || "",
      "Effect of the Year — Clip Upload": answers["Effect of the Year — Clip Upload"] || "",
      "Clip of the Year — Performer + Description": answers["Clip of the Year — Performer + Description"] || "",
      "Clip of the Year — Clip Link": answers["Clip of the Year — Clip Link"] || "",
      "Clip of the Year — Clip Upload": answers["Clip of the Year — Clip Upload"] || "",
      "Most Memeable Moment — Description": answers["Most Memeable Moment — Description"] || "",
      "Most Memeable Moment — Clip Link": answers["Most Memeable Moment — Clip Link"] || "",
      "Most Memeable Moment — Clip Upload": answers["Most Memeable Moment — Clip Upload"] || "",
      "Judge of the Year — Nominee Name": answers["Judge of the Year — Nominee Name"] || "",
      "Judge of the Year — House Affiliation": answers["Judge of the Year — House Affiliation"] || "",
      "Out of Towner of the Year — Nominee Name + City": answers["Out of Towner of the Year — Nominee Name + City"] || "",
      "Out of Towner of the Year — Social Handle": answers["Out of Towner of the Year — Social Handle"] || "",
      "Leader of the Year MF — Nominee Name": answers["Leader of the Year MF — Nominee Name"] || "",
      "Leader of the Year MF — House Affiliation": answers["Leader of the Year MF — House Affiliation"] || "",
      "Leader of the Year FF — Nominee Name": answers["Leader of the Year FF — Nominee Name"] || "",
      "Leader of the Year FF — House Affiliation": answers["Leader of the Year FF — House Affiliation"] || "",
      "Ballroom Impact Award — Nominee Name": answers["Ballroom Impact Award — Nominee Name"] || "",
      "Ballroom Impact Award — House Affiliation": answers["Ballroom Impact Award — House Affiliation"] || "",
      "Community Impact Award — Nominee Name": answers["Community Impact Award — Nominee Name"] || "",
      "Community Impact Award — House Affiliation": answers["Community Impact Award — House Affiliation"] || "",
      "Supporting Statement": answers["Supporting Statement"] || "",
      "Video Key": videoInfo.key || "",
      "Video Filename": videoInfo.filename || ""
    };

    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    if (!res.ok) {
      throw new Error(`Google Apps Script request failed: ${res.status} ${await res.text()}`);
    }

    console.log(`Successfully sent nomination ${id} to Google Sheets via Apps Script`);
    return true;
  } catch (err) {
    console.error(`Error sending nomination data to Google Sheets:`, err.message || err);
    return false;
  }
}
