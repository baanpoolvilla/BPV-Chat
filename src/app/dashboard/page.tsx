'use client';

import { useEffect, useMemo } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  MessageCircle,
  MessageSquare,
  Tag,
  Users,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  BarChart3,
  Activity,
  UserCheck,
} from 'lucide-react';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

function DashboardContent() {
  const { stats, statsLoading, fetchStats, conversations, fetchConversations, user, setConversationFilter } = useChatStore();
  const router = useRouter();

  const navigateToConversations = (filter: 'all' | 'open' | 'pending' | 'resolved') => {
    setConversationFilter(filter);
    router.push('/conversations');
  };

  useEffect(() => {
    fetchStats();
    fetchConversations();
  }, []);

  const mockStats = stats || {
    totalConversations: 0,
    botHandled: 0,
    humanRequired: 0,
    resolved: 0,
  };

  // Derived stats
  const derived = useMemo(() => {
    const total = conversations.length;
    const open = conversations.filter((c) => c.status !== 'resolved').length;
    const resolved = conversations.filter((c) => c.status === 'resolved').length;
    const unread = conversations.filter((c) => c.unreadCount > 0).length;
    const lineCount = conversations.filter((c) => c.channel === 'line').length;
    const fbCount = conversations.filter((c) => c.channel === 'facebook').length;
    const igCount = conversations.filter((c) => c.channel === 'instagram').length;
    const tagged = conversations.filter((c) => c.labels.length > 0).length;

    // Tag distribution
    const tagMap = new Map<string, { name: string; color: string; count: number }>();
    conversations.forEach((c) =>
      c.labels.forEach((l) => {
        const existing = tagMap.get(l.name);
        if (existing) existing.count++;
        else tagMap.set(l.name, { name: l.name, color: l.color, count: 1 });
      })
    );
    const topTags = Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return { total, open, resolved, unread, lineCount, fbCount, igCount, tagged, topTags };
  }, [conversations]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome + Summary Bar */}
      <div className="bg-gradient-to-r from-primary via-orange-500 to-amber-400 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">
            สวัสดี, {user?.name || 'Admin'} 👋
          </h1>
          <p className="text-white/80 text-sm mb-4">
            ภาพรวมการสนทนาทั้งหมดในระบบ
          </p>
          {/* Mini stat pills */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-semibold">{derived.open}</span>
              <span className="text-xs text-white/70">กำลังสนทนา</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">{derived.unread}</span>
              <span className="text-xs text-white/70">ยังไม่อ่าน</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm font-semibold">{derived.resolved}</span>
              <span className="text-xs text-white/70">เสร็จสิ้นแล้ว</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigateToConversations('all')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{mockStats.totalConversations || derived.total}</p>
              <p className="text-xs text-muted-foreground">บทสนทนาทั้งหมด</p>
            </CardContent>
          </Card>

          <Card
            className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => navigateToConversations('open')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                {derived.unread > 0 && (
                  <span className="min-w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1.5">
                    {derived.unread}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{derived.open}</p>
              <p className="text-xs text-muted-foreground">กำลังสนทนา</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]" onClick={() => navigateToConversations('all')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{derived.tagged}</p>
              <p className="text-xs text-muted-foreground">ติดแท็กแล้ว</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]" onClick={() => navigateToConversations('resolved')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{derived.resolved}</p>
              <p className="text-xs text-muted-foreground">เสร็จสิ้นแล้ว</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main grid: Recent conversations + Channel breakdown + Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations — 2 cols */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                บทสนทนาล่าสุด
              </CardTitle>
              <Link href="/conversations" className="text-xs text-primary hover:underline flex items-center gap-1">
                ดูทั้งหมด <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {conversations.slice(0, 6).map((conv) => (
                <Link
                  key={conv.id}
                  href="/conversations"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0 overflow-hidden">
                      {conv.customerAvatar ? (
                        <img src={conv.customerAvatar} alt={conv.customerName} className="w-full h-full object-cover" />
                      ) : (
                        (conv.customerName || '?').charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{conv.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {conv.labels.slice(0, 1).map((l) => (
                      <span key={l.id} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: l.color }}>
                        {l.name}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.lastMessageAt || conv.createdAt), { addSuffix: false, locale: th })}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="min-w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              {conversations.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">ยังไม่มีบทสนทนา</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column: Channels + Tags */}
        <div className="space-y-6">
          {/* Channel Breakdown */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                ช่องทาง
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { label: 'LINE', count: derived.lineCount, color: 'bg-[#06c755]', total: derived.total },
                { label: 'Facebook', count: derived.fbCount, color: 'bg-[#1877f2]', total: derived.total },
                { label: 'Instagram', count: derived.igCount, color: 'bg-[#e4405f]', total: derived.total },
              ].map((ch) => (
                <div key={ch.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{ch.label}</span>
                    <span className="text-muted-foreground text-xs">{ch.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', ch.color)}
                      style={{ width: ch.total > 0 ? `${(ch.count / ch.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
              {derived.total === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">ยังไม่มีข้อมูล</p>
              )}
            </CardContent>
          </Card>

          {/* Top Tags */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  แท็กยอดนิยม
                </CardTitle>
                <Link href="/tags" className="text-xs text-primary hover:underline flex items-center gap-1">
                  จัดการ <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {derived.topTags.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">ยังไม่มีแท็ก</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {derived.topTags.map((t) => (
                    <span
                      key={t.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.name}
                      <span className="bg-white/25 rounded-full px-1.5 text-[10px]">{t.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/conversations" className="block">
          <Card className="hover:shadow-md transition-all hover:scale-[1.02] border-none shadow-sm cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">รวมแชท</p>
                <p className="text-xs text-muted-foreground">จัดการบทสนทนาทุกช่องทาง</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/tags" className="block">
          <Card className="hover:shadow-md transition-all hover:scale-[1.02] border-none shadow-sm cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">จัดการแท็ก</p>
                <p className="text-xs text-muted-foreground">เพิ่ม แก้ไข ลบแท็กสนทนา</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings" className="block">
          <Card className="hover:shadow-md transition-all hover:scale-[1.02] border-none shadow-sm cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">ตั้งค่าระบบ</p>
                <p className="text-xs text-muted-foreground">จัดการการตั้งค่าแพลตฟอร์ม</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedLayout title="หน้าหลัก">
      <DashboardContent />
    </ProtectedLayout>
  );
}
