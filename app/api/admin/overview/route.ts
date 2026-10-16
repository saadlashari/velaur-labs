import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { getPublishedProjects,getPublicArticles } from '@/lib/public-content';

export const runtime = 'nodejs';

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  try {
    const user = await getCurrentAdmin();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const [inquiries, users, activity, projects, recentProjects, blogPosts, approvals,publicArticles] = await Promise.all([
      db.query<{ status: string; count: string }>('SELECT status, COUNT(*)::text AS count FROM inquiries GROUP BY status'),
      db.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM admin_users WHERE is_active = TRUE'),
      db.query<{ id: string; action: string; module: string; created_at: Date; display_name: string | null }>(
        `SELECT a.id, a.action, a.module, a.created_at, u.display_name
           FROM audit_logs a LEFT JOIN admin_users u ON u.id = a.actor_user_id
          ORDER BY a.created_at DESC LIMIT 8`,
      ),
      getPublishedProjects(),
      db.query<{ id: string; title: string; category: string; status: string; updated_at: Date }>("SELECT id, title, category, status, updated_at FROM projects ORDER BY updated_at DESC LIMIT 5"),
      db.query<{ count: string; drafts: string }>("SELECT COUNT(*) FILTER (WHERE status = 'PUBLISHED')::text AS count, COUNT(*) FILTER (WHERE status IN ('DRAFT','IN_REVIEW','SCHEDULED'))::text AS drafts FROM blog_posts"),
      db.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM content_approvals WHERE status = 'PENDING'"),
      getPublicArticles(),
    ]);
    const inquiryCounts = Object.fromEntries(inquiries.rows.map((row) => [row.status, Number(row.count)]));
    return NextResponse.json({
      user: { id: user.id, displayName: user.display_name, email: user.email, role: user.role },
      inquiries: { total: Object.values(inquiryCounts).reduce((sum, count) => sum + count, 0), byStatus: inquiryCounts },
      activeAdmins: Number(users.rows[0]?.count ?? 0),
      recentActivity: activity.rows,
      projects: projects.length,
      recentProjects: recentProjects.rows,
      blogPosts: publicArticles.length,
      blogDrafts: Number(blogPosts.rows[0]?.drafts ?? 0),
      pendingApprovals: Number(approvals.rows[0]?.count ?? 0),
      connected: true,
    });
  } catch (error) {
    console.error('Admin overview query failed', error);
    return NextResponse.json({ error: 'Could not load dashboard data. Confirm the latest db/schema.sql has been applied.' }, { status: 500 });
  }
}
