import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

/**
 * GET /api/db/messages?conversationId=xxx
 * ดึงข้อความทั้งหมดของ conversation
 */
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const query = `
      SELECT
        m.id::TEXT           AS id,
        m.conversation_id::TEXT AS conversation_id,
        m.sender_type,
        m.direction,
        m.message_type,
        COALESCE(m.content_text, '') AS content_text,
        m.created_at,
        u.id::TEXT           AS sender_user_id,
        COALESCE(u.display_name, u.external_user_id, m.sender_type) AS sender_name,
        u.picture_url        AS sender_avatar
      FROM messages m
      LEFT JOIN users u ON m.sender_user_id = u.id
      WHERE m.conversation_id = $1::UUID
        AND m.is_deleted = FALSE
      ORDER BY m.created_at ASC
      LIMIT 500;
    `;

    const result = await pool.query(query, [conversationId]);

    const messages = result.rows.map((r: any) => ({
      id: r.id,
      conversationId: r.conversation_id,
      senderType: r.sender_type,
      type: r.sender_type,
      direction: r.direction,
      messageType: r.message_type,
      contentText: r.content_text,
      content: r.content_text || '',
      sender: {
        id: r.sender_user_id || r.sender_type,
        name: r.sender_name || r.sender_type,
        type: r.sender_type,
        avatar: r.sender_avatar || null,
      },
      timestamp: r.created_at,
      isRead: true,
    }));

    return NextResponse.json(
      { messages, total: messages.length },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('GET /api/db/messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/db/messages/send
 * Body: { conversationId, content, type? }
 * บันทึกข้อความ admin + push ไป LINE
 */
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'conversationId and content are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Insert message + get external user id for LINE push
    const insertQuery = `
      WITH conv_user AS (
        SELECT u.external_user_id
        FROM conversations c
        JOIN users u ON c.customer_user_id = u.id
        WHERE c.id = $1::UUID
      ),
      inserted AS (
        INSERT INTO messages (conversation_id, sender_type, direction, message_type, content_text)
        VALUES ($1::UUID, 'admin', 'outbound', 'text', $2)
        RETURNING id::TEXT, conversation_id::TEXT, sender_type, content_text, created_at
      )
      SELECT i.*, cu.external_user_id
      FROM inserted i, conv_user cu;
    `;

    const result = await pool.query(insertQuery, [conversationId, content]);
    const saved = result.rows[0];

    // Update last_message_at
    await pool.query(
      'UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1::UUID',
      [conversationId]
    );

    // Push to LINE (best-effort, don't fail the API call)
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (lineToken && saved.external_user_id?.startsWith('U')) {
      try {
        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${lineToken}`,
          },
          body: JSON.stringify({
            to: saved.external_user_id,
            messages: [{ type: 'text', text: content }],
          }),
        });
      } catch (lineErr) {
        console.error('LINE push failed:', lineErr);
      }
    }

    return NextResponse.json(
      {
        id: saved.id,
        conversationId: saved.conversation_id,
        senderType: 'admin',
        type: 'admin',
        direction: 'outbound',
        messageType: 'text',
        contentText: saved.content_text,
        content: saved.content_text || '',
        sender: { id: 'admin', name: 'Admin', type: 'admin' },
        timestamp: saved.created_at,
        isRead: true,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('POST /api/db/messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
