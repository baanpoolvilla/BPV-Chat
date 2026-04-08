'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader, Zap } from 'lucide-react';
import type { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, authLoading, isAuthenticated } = useChatStore();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (email && password) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          role: email.includes('admin') ? 'admin' : 'staff',
        };

        const token = 'mock_token_' + Date.now();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(mockUser));

        useChatStore.setState({
          user: mockUser,
          isAuthenticated: true,
        });

        router.push('/dashboard');
      }
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f36734]/10 via-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        {/* Header */}
        <div className="text-center p-8 pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <Zap className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h1>
          <p className="text-muted-foreground text-sm mt-1">ระบบจัดการแชทบอท AI</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-4 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">อีเมล</label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">รหัสผ่าน</label>
            <Input
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full btn-primary-gradient h-11"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2 text-center text-sm text-muted-foreground">
          <p className="mb-1 font-medium">ข้อมูลสำหรับทดสอบ:</p>
          <p>อีเมล: admin@example.com</p>
          <p>รหัสผ่าน: password</p>
        </div>
      </Card>
    </div>
  );
}
