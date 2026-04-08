'use client';

import { useState } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Loader,
} from 'lucide-react';

// Channel icon components
function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  connected: boolean;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    secret?: boolean;
    value: string;
  }[];
  webhookUrl: string;
  docsUrl: string;
  description: string;
  steps: string[];
}

function PlatformCard({ platform, onSave }: { platform: PlatformConfig; onSave: (id: string, fields: Record<string, string>) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(platform.fields.map((f) => [f.key, f.value]))
  );
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave(platform.id, values);
    setSaving(false);
    setEditing(false);
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(platform.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasAllFields = platform.fields.every((f) => values[f.key]?.trim());

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: platform.bgColor }}
          >
            {platform.icon}
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{platform.name}</h3>
            <p className="text-xs text-muted-foreground">{platform.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {platform.connected ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              เชื่อมต่อแล้ว
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
              <XCircle className="h-3.5 w-3.5" />
              ยังไม่เชื่อมต่อ
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Webhook URL */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Webhook URL (ใช้ตั้งค่าในแพลตฟอร์ม)
          </label>
          <div className="flex gap-2">
            <Input
              value={platform.webhookUrl}
              readOnly
              className="text-xs font-mono bg-muted/50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyWebhook}
              className="flex-shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Config fields */}
        {platform.fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {field.label}
            </label>
            <div className="flex gap-2">
              <Input
                type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                disabled={!editing}
                className="text-sm"
              />
              {field.secret && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSecret(field.key)}
                  className="flex-shrink-0"
                >
                  {showSecrets[field.key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Setup Steps */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-card-foreground mb-2">ขั้นตอนการเชื่อมต่อ</h4>
          <ol className="space-y-1.5">
            {platform.steps.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="font-semibold text-primary flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <a
            href={platform.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            ดูคู่มือฉบับเต็ม
          </a>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setValues(Object.fromEntries(platform.fields.map((f) => [f.key, f.value])));
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasAllFields || saving}
                >
                  {saving ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    'บันทึก'
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                แก้ไขการตั้งค่า
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const WEBHOOK_BASE = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook`
    : 'https://your-domain.com/api/webhook';

  const [platforms, setPlatforms] = useState<PlatformConfig[]>([
    {
      id: 'line',
      name: 'LINE Official Account',
      icon: <LineIcon className="h-5 w-5 text-white" />,
      color: '#06c755',
      bgColor: '#06c755',
      connected: false,
      description: 'เชื่อมต่อ LINE OA เพื่อรับ-ส่งข้อความกับลูกค้าผ่าน LINE',
      webhookUrl: `${WEBHOOK_BASE}/line`,
      docsUrl: 'https://developers.line.biz/en/docs/messaging-api/',
      fields: [
        { key: 'channelId', label: 'Channel ID', placeholder: 'เช่น 1234567890', value: '' },
        { key: 'channelSecret', label: 'Channel Secret', placeholder: 'เช่น abcdef1234567890', secret: true, value: '' },
        { key: 'channelAccessToken', label: 'Channel Access Token (Long-lived)', placeholder: 'เช่น xxxxxx...', secret: true, value: '' },
      ],
      steps: [
        'ไปที่ LINE Developers Console (developers.line.biz)',
        'สร้าง Provider ใหม่ หรือเลือก Provider ที่มีอยู่',
        'สร้าง Messaging API Channel ใหม่',
        'คัดลอก Channel ID, Channel Secret จากแท็บ Basic settings',
        'ไปที่แท็บ Messaging API แล้วกด Issue เพื่อสร้าง Channel Access Token',
        'คัดลอก Webhook URL ด้านบน แล้วนำไปวางในช่อง Webhook URL ของ LINE Developers',
        'เปิด Use webhook ให้เป็น Enabled',
        'ปิด Auto-reply messages (ถ้าต้องการให้บอทตอบแทน)',
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      icon: <FacebookIcon className="h-5 w-5 text-white" />,
      color: '#1877f2',
      bgColor: '#1877f2',
      connected: false,
      description: 'เชื่อมต่อ Facebook Page เพื่อรับ-ส่งข้อความ Messenger',
      webhookUrl: `${WEBHOOK_BASE}/facebook`,
      docsUrl: 'https://developers.facebook.com/docs/messenger-platform/',
      fields: [
        { key: 'pageId', label: 'Page ID', placeholder: 'เช่น 123456789012345', value: '' },
        { key: 'appId', label: 'App ID', placeholder: 'เช่น 123456789012345', value: '' },
        { key: 'appSecret', label: 'App Secret', placeholder: 'เช่น abcdef1234567890', secret: true, value: '' },
        { key: 'pageAccessToken', label: 'Page Access Token', placeholder: 'เช่น EAAxxxxxxx...', secret: true, value: '' },
        { key: 'verifyToken', label: 'Verify Token', placeholder: 'สร้างรหัสใดก็ได้ เช่น my_verify_token_123', value: '' },
      ],
      steps: [
        'ไปที่ Meta for Developers (developers.facebook.com)',
        'สร้าง App ใหม่ ประเภท Business → เลือก Messenger',
        'ไปที่ Settings → Basic เพื่อดู App ID และ App Secret',
        'ในหน้า Messenger Settings ให้เชื่อมต่อ Facebook Page',
        'กด Generate Token เพื่อได้ Page Access Token',
        'ตั้งค่า Webhooks: ใส่ Webhook URL และ Verify Token จากด้านบน',
        'Subscribe Webhooks ให้ fields: messages, messaging_postbacks',
        'ส่ง App เข้ารีวิว เพื่อขอ pages_messaging permission (Production)',
      ],
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <InstagramIcon className="h-5 w-5 text-white" />,
      color: '#e4405f',
      bgColor: '#e4405f',
      connected: false,
      description: 'เชื่อมต่อ Instagram Business เพื่อรับ-ส่ง DM อัตโนมัติ',
      webhookUrl: `${WEBHOOK_BASE}/instagram`,
      docsUrl: 'https://developers.facebook.com/docs/instagram-api/',
      fields: [
        { key: 'igAccountId', label: 'Instagram Business Account ID', placeholder: 'เช่น 17841400000000000', value: '' },
        { key: 'appId', label: 'App ID (ใช้ร่วมกับ Facebook App)', placeholder: 'เช่น 123456789012345', value: '' },
        { key: 'appSecret', label: 'App Secret', placeholder: 'เช่น abcdef1234567890', secret: true, value: '' },
        { key: 'accessToken', label: 'Access Token', placeholder: 'เช่น IGQVJxxxxxxx...', secret: true, value: '' },
      ],
      steps: [
        'แปลงบัญชี Instagram เป็น Business Account หรือ Creator Account',
        'เชื่อมต่อ Instagram กับ Facebook Page',
        'ใช้ Meta App เดียวกับ Facebook (หรือสร้างใหม่)',
        'ในหน้า App Dashboard → เพิ่ม Instagram product',
        'สร้าง Access Token ที่มี instagram_manage_messages permission',
        'ตั้งค่า Webhooks ใน App Dashboard ใส่ Webhook URL จากด้านบน',
        'Subscribe fields: messages ใน Instagram Webhooks',
        'ทดสอบส่ง DM ไปที่บัญชี Instagram ของคุณ',
      ],
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <TikTokIcon className="h-5 w-5 text-white" />,
      color: '#000000',
      bgColor: '#000000',
      connected: false,
      description: 'เชื่อมต่อ TikTok Business เพื่อรับแจ้งเตือนข้อความ',
      webhookUrl: `${WEBHOOK_BASE}/tiktok`,
      docsUrl: 'https://developers.tiktok.com/doc/',
      fields: [
        { key: 'clientKey', label: 'Client Key', placeholder: 'เช่น awxxxxxxxxxxxxxxx', value: '' },
        { key: 'clientSecret', label: 'Client Secret', placeholder: 'เช่น xxxxxxxxxxxxxxxx', secret: true, value: '' },
        { key: 'accessToken', label: 'Access Token', placeholder: 'เช่น act.xxxxxxx...', secret: true, value: '' },
      ],
      steps: [
        'ไปที่ TikTok for Developers (developers.tiktok.com)',
        'สร้าง App ใหม่ภายใต้ TikTok for Business',
        'เลือก product ที่ต้องการ (Message API)',
        'คัดลอก Client Key และ Client Secret จากหน้า App Management',
        'ตั้งค่า Redirect URL / Webhook URL ตามด้านบน',
        'ขอ Access Token ผ่าน OAuth flow',
        'ส่ง App เข้ารีวิวเพื่อเปิดใช้งานจริง',
        'หมายเหตุ: TikTok Message API อยู่ใน Beta — ตรวจสอบ availability ในภูมิภาคของคุณ',
      ],
    },
  ]);

  const handleSave = (id: string, fields: Record<string, string>) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              connected: Object.values(fields).every((v) => v.trim()),
              fields: p.fields.map((f) => ({ ...f, value: fields[f.key] || '' })),
            }
          : p
      )
    );
  };

  return (
    <ProtectedLayout title="ตั้งค่าการเชื่อมต่อ">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">ตั้งค่าการเชื่อมต่อแพลตฟอร์ม</h1>
          <p className="text-sm text-muted-foreground mt-1">
            เชื่อมต่อช่องทางต่าง ๆ เพื่อรวมแชทจากทุกแพลตฟอร์มมาไว้ในที่เดียว
          </p>
        </div>

        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onSave={handleSave}
          />
        ))}
      </div>
    </ProtectedLayout>
  );
}
