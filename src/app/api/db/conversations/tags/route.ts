import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

/**
 * POST /api/db/conversations/tags
 * Body: { conversationId, tags: [{ name, color }] }
 * ลบ tag เดิมทั้งหมดของ conversation แล้ว upsert ใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const body = await request.json();
    const conversationId = body.conversationId;
    const tags: { name: string; color: string }[] = Array.isArray(body.tags) ? body.tags : [];

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing tags for this conversation
      await client.query(
        'DELETE FROM conversation_tags WHERE conversation_id = $1::UUID;',
        [conversationId]
      );

      // Upsert each tag and link to conversation
      for (const tag of tags) {
        const name = String(tag.name || '').trim();
        const color = String(tag.color || '#2563eb').trim();
        if (!name) continue;

        const tagResult = await client.query(
          `INSERT INTO tags (name, color, scope)
           VALUES ($1, $2, 'conversation')
           ON CONFLICT (name, scope) DO UPDATE SET color = EXCLUDED.color
           RETURNING id;`,
          [name, color]
        );

        const tagId = tagResult.rows[0]?.id;
        if (tagId) {
          await client.query(
            `INSERT INTO conversation_tags (conversation_id, tag_id)
             VALUES ($1::UUID, $2)
             ON CONFLICT DO NOTHING;`,
            [conversationId, tagId]
          );
        }
      }

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

    // Return updated labels
    const labelsResult = await pool.query(
      `SELECT t.id::TEXT, t.name, t.color
       FROM conversation_tags ct
       JOIN tags t ON ct.tag_id = t.id
       WHERE ct.conversation_id = $1::UUID
       ORDER BY t.name;`,
      [conversationId]
    );

    return NextResponse.json(
      { conversationId, labels: labelsResult.rows },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('POST /api/db/conversations/tags error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
