import { getDatabase } from '@netlify/database';

const json = (body, init = {}) => Response.json(body, init);

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, { status: 405 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.id) {
    return json({ error: 'A nominee id is required.' }, { status: 400 });
  }

  try {
    const db = getDatabase();
    const [updated] = await db.sql`
      UPDATE nominations
      SET vote_count = vote_count + 1
      WHERE id = ${body.id} AND status = 'approved'
      RETURNING id, vote_count
    `;

    if (!updated) {
      return json({ error: 'Approved nominee not found.' }, { status: 404 });
    }

    return json({ ok: true, nomination: updated });
  } catch (err) {
    console.error('Vote error:', err);
    return json({ error: 'Vote could not be saved. Please try again.' }, { status: 500 });
  }
};

export const config = {
  path: '/api/vote',
};
