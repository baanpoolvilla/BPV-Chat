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
 * GET /api/db/tags — ดึง tags ทั้งหมด
 */
export async function GET() {
  try {
    const pool = getPool();

    // Auto-migrate scope from enum to varchar if needed
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'tags'
            AND column_name = 'scope' AND udt_name = 'tag_scope'
        ) THEN
          ALTER TABLE tags ALTER COLUMN scope TYPE VARCHAR(100) USING scope::TEXT;
        END IF;
      END $$;
    `);

    const result = await pool.query(
      'SELECT id::TEXT, name, color, scope FROM tags ORDER BY name;'
    );

    return NextResponse.json(
      { tags: result.rows, total: result.rows.length },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('GET /api/db/tags error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/db/tags — สร้าง tag ใหม่
 * Body: { name, color, scope }
 */
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const body = await request.json();
    const name = String(body.name || '').trim();
    const color = String(body.color || '#2563eb').trim();
    const scope = String(body.scope || 'global').trim();

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Auto-migrate scope column
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'tags'
            AND column_name = 'scope' AND udt_name = 'tag_scope'
        ) THEN
          ALTER TABLE tags ALTER COLUMN scope TYPE VARCHAR(100) USING scope::TEXT;
        END IF;
      END $$;
    `);

    await pool.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_scope ON tags (name, scope);'
    );

    const result = await pool.query(
      `INSERT INTO tags (name, color, scope)
       VALUES ($1, $2, $3)
       ON CONFLICT (name, scope) DO UPDATE SET color = EXCLUDED.color
       RETURNING id::TEXT, name, color, scope;`,
      [name, color, scope]
    );

    return NextResponse.json(result.rows[0], { headers: corsHeaders });
  } catch (error: any) {
    console.error('POST /api/db/tags error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
