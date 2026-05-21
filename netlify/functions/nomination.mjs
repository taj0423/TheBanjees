import { getStore } from '@netlify/blobs';
import { getDatabase } from '@netlify/database';
import { sendToGoogleSheets } from './googleSheets.mjs';

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const CHECKBOX_FIELD = 'All Acknowledgments Confirmed';
const VIDEO_FIELD = 'Video Evidence';

const json = (body, init = {}) => Response.json(body, init);

const safeFilename = (name) => {
  const cleaned = String(name || 'video').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  return cleaned.slice(0, 120) || 'video';
};

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, { status: 405 });
  }

  try {
    let form;
    form = await request.formData();
    const answers = {};
    for (const [key, value] of form.entries()) {
      if (key === VIDEO_FIELD) continue;

      if (value && typeof value !== 'string' && value.size > 0) {
        if (!value.type.startsWith('video/')) {
          return json({ error: `Please upload a valid video file for ${key.replace(' — Clip Upload', '')}.` }, { status: 400 });
        }
        if (value.size > MAX_VIDEO_BYTES) {
          return json({ error: `Video uploads for ${key.replace(' — Clip Upload', '')} must be 500 MB or smaller.` }, { status: 400 });
        }

        const blobKey = `nomination-videos/${crypto.randomUUID()}-${safeFilename(value.name)}`;
        const store = getStore('banjees-uploads');
        await store.set(blobKey, value);
        answers[key] = blobKey;
      } else if (value && typeof value !== 'string') {
        answers[key] = '';
      } else {
        answers[key] = typeof value === 'string' ? value.trim() : '';
      }
    }

    const nominatorName = answers['Nominator Name'] || '';
    const nominatorContact = answers['Nominator Contact'] || '';
    const statement = answers['Supporting Statement'] || '';
    const acknowledgmentsConfirmed = answers[CHECKBOX_FIELD] === 'Yes';
    const hasNomination = Object.entries(answers).some(([key, value]) => {
      return key !== 'Nominator Name'
        && key !== 'Nominator Contact'
        && key !== 'Nominator Affiliation'
        && key !== 'Supporting Statement'
        && key !== CHECKBOX_FIELD
        && value;
    });

    if (!nominatorName || !nominatorContact) {
      return json({ error: 'Please enter your name and contact info before submitting.' }, { status: 400 });
    }
    if (!hasNomination) {
      return json({ error: 'Please answer at least one award nomination question before submitting.' }, { status: 400 });
    }
    if (!statement) {
      return json({ error: 'Please answer the supporting statement question before submitting.' }, { status: 400 });
    }
    if (!acknowledgmentsConfirmed) {
      return json({ error: 'Please check all four acknowledgment boxes before submitting.' }, { status: 400 });
    }

    const video = form.get(VIDEO_FIELD);
    let videoInfo = {
      key: null,
      filename: null,
      contentType: null,
      size: null,
    };

    if (video && typeof video !== 'string' && video.size > 0) {
      if (!video.type.startsWith('video/')) {
        return json({ error: 'Please upload a valid video file.' }, { status: 400 });
      }
      if (video.size > MAX_VIDEO_BYTES) {
        return json({ error: 'Video uploads must be 500 MB or smaller.' }, { status: 400 });
      }

      const key = `nomination-videos/${crypto.randomUUID()}-${safeFilename(video.name)}`;
      const store = getStore('banjees-uploads');
      await store.set(key, video);
      videoInfo = {
        key,
        filename: video.name || 'video',
        contentType: video.type || 'application/octet-stream',
        size: video.size,
      };
    }

    const id = crypto.randomUUID();
    const db = getDatabase();
    const [saved] = await db.sql`
      INSERT INTO nominations (
        id,
        nominator_name,
        nominator_contact,
        answers,
        video_key,
        video_filename,
        video_content_type,
        video_size_bytes
      )
      VALUES (
        ${id},
        ${nominatorName},
        ${nominatorContact},
        ${JSON.stringify(answers)}::jsonb,
        ${videoInfo.key},
        ${videoInfo.filename},
        ${videoInfo.contentType},
        ${videoInfo.size}
      )
      RETURNING id
    `;

    try {
      await sendToGoogleSheets(saved.id, answers, videoInfo);
    } catch (gErr) {
      console.error('Failed to send data to Google Sheets:', gErr);
    }

    return json({ ok: true, id: saved.id }, { status: 201 });
  } catch {
    return json({ error: 'Submission could not be saved. Please try again.' }, { status: 500 });
  }
};

export const config = {
  path: '/api/nomination',
};
