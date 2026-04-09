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
 * POST /api/db/tags/delete
 * Body: { tagId }
 */
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const body = await request.json();
    const tagId = body.tagId;

    if (!tagId) {
      return NextResponse.json(
        { error: 'tagId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    await pool.query('DELETE FROM conversation_tags WHERE tag_id = $1::UUID;', [tagId]);
    await pool.query('DELETE FROM tags WHERE id = $1::UUID;', [tagId]);

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('POST /api/db/tags/delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
