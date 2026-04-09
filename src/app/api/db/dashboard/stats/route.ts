import { NextResponse } from 'next/server';
import getPool from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

/**
 * GET /api/db/dashboard/stats
 */
export async function GET() {
  try {
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM conversations WHERE status != 'archived')::INT           AS total_conversations,
        (SELECT COUNT(*) FROM conversations WHERE status IN ('open','pending'))::INT   AS human_required,
        0                                                                               AS bot_handled,
        (SELECT COUNT(*) FROM messages
         WHERE created_at >= CURRENT_DATE AND is_deleted = FALSE)::INT                  AS today_messages,
        (SELECT COUNT(DISTINCT c.id)
         FROM conversations c
         JOIN users u ON c.customer_user_id = u.id
         WHERE u.channel = 'line')::INT                                                 AS line_count,
        (SELECT COUNT(*) FROM conversations WHERE status = 'resolved')::INT             AS resolved_count;
    `);

    const r = result.rows[0];
    const total = parseInt(r.total_conversations) || 0;
    const human = parseInt(r.human_required) || 0;
    const bot = parseInt(r.bot_handled) || 0;
    const today = parseInt(r.today_messages) || 0;
    const line = parseInt(r.line_count) || 0;
    const resolved = parseInt(r.resolved_count) || 0;

    return NextResponse.json(
      {
        totalConversations: total,
        botHandled: bot,
        humanRequired: human,
        resolved,
        channelStats: { line, facebook: 0, instagram: 0, tiktok: 0 },
        todayMessages: today,
        responseRate: 0,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('GET /api/db/dashboard/stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
