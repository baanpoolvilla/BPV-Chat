import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

// CORS helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

/**
 * GET /api/db/conversations
 * Query params: status?, search?, limit?
 */
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    const conditions: string[] = ["c.status != 'archived'"];
    const params: any[] = [];
    let idx = 1;

    if (status && status !== 'all') {
      conditions.push(`c.status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (search) {
      conditions.push(`(u.display_name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.external_user_id ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    params.push(limit);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        c.id::TEXT AS id,
        c.channel,
        c.status,
        c.last_message_at,
        c.created_at,
        c.updated_at,
        c.bot_enabled,
        u.id::TEXT AS customer_user_id,
        u.external_user_id,
        u.display_name,
        u.picture_url,
        u.phone,
        u.email,
        COALESCE((
          SELECT m.content_text
          FROM   messages m
          WHERE  m.conversation_id = c.id AND m.is_deleted = FALSE
          ORDER  BY m.created_at DESC
          LIMIT  1
        ), '') AS last_message,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id',    t.id::TEXT,
              'name',  t.name,
              'color', t.color,
              'scope', t.scope
            ) ORDER BY t.name
          )
          FROM conversation_tags ct
          JOIN tags t ON ct.tag_id = t.id
          WHERE ct.conversation_id = c.id
        ), '[]'::json) AS labels,
        (
          SELECT COUNT(*)::INT
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.direction = 'inbound'
            AND m.is_deleted = FALSE
            AND NOT EXISTS (
              SELECT 1 FROM message_read_receipts r WHERE r.message_id = m.id
            )
        ) AS unread_count
      FROM conversations c
      JOIN users u ON c.customer_user_id = u.id
      ${whereClause}
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT $${idx};
    `;

    const result = await pool.query(query, params);

    const conversations = result.rows.map((r: any) => {
      let labels = r.labels;
      if (typeof labels === 'string') {
        try { labels = JSON.parse(labels); } catch { labels = []; }
      }
      return {
        id: r.id,
        customerUserId: r.customer_user_id,
        customerExternalId: r.external_user_id,
        customerName: r.display_name || r.external_user_id || r.id,
        customerAvatar: r.picture_url || null,
        customerEmail: r.email || '',
        customerPhone: r.phone || '',
        channel: r.channel,
        status: r.status,
        lastMessage: r.last_message || '',
        lastMessageAt: r.last_message_at,
        unreadCount: parseInt(r.unread_count) || 0,
        labels: Array.isArray(labels) ? labels : [],
        messages: [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    return NextResponse.json(
      { conversations, total: conversations.length },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('GET /api/db/conversations error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
