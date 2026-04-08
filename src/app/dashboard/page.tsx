'use client';

import { useEffect } from 'react';
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
  BookOpen,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  onClick,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`hover:shadow-md transition-all border-none shadow-sm ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}



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
    totalConversations: 42,
    botHandled: 0,
    humanRequired: 38,
    resolved: 4,
  };

  const lineTagged = conversations.filter((conv) => conv.channel === 'line' && conv.labels.length > 0).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              สวัสดี, {user?.name || 'Admin'} 👋
            </h1>
            <p className="text-white/80 text-sm">
              ยินดีต้อนรับกลับมา! มาดูภาพรวมของวันนี้กัน
            </p>
          </div>
          <div className="hidden sm:block">
            <Star className="h-16 w-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="บทสนทนาทั้งหมด"
            value={mockStats.totalConversations}
            icon={MessageCircle}
            color="text-blue-600"
            bgColor="bg-blue-50"
            onClick={() => navigateToConversations('all')}
          />
          <StatCard
            title="LINE ติดแท็กแล้ว"
            value={lineTagged}
            icon={Tag}
            color="text-purple-600"
            bgColor="bg-purple-50"
            onClick={() => navigateToConversations('all')}
          />
          <StatCard
            title="รอแอดมิน"
            value={mockStats.humanRequired}
            icon={Users}
            color="text-orange-600"
            bgColor="bg-orange-50"
            onClick={() => navigateToConversations('open')}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Conversations */}
        <Card className="border-none shadow-sm">
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
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <Link
                  key={conv.id}
                  href="/conversations"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                      {conv.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{conv.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      conv.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {conv.status === 'resolved' ? 'เสร็จ' : 'เปิด'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-semibold mt-1 ml-auto">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </Link>
              ))}

              {conversations.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  ยังไม่มีบทสนทนา
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/conversations" className="block">
          <Card className="hover:shadow-md transition-all hover:scale-[1.02] border-none shadow-sm cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">รวมแชท</p>
                <p className="text-xs text-muted-foreground">จัดการบทสนทนาทุกช่องทาง</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-all border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">วิธีใช้งาน</p>
              <p className="text-xs text-muted-foreground">คู่มือการใช้งานแพลตฟอร์ม</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">การอัพเดตแพลตฟอร์ม</p>
              <p className="text-xs text-muted-foreground">ดูฟีเจอร์ใหม่ล่าสุด</p>
            </div>
          </CardContent>
        </Card>
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
