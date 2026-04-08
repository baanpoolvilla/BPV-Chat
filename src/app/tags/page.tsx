'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tag, Plus, Trash2, Loader, Palette } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  color: string;
  scope: string;
}

const PRESET_COLORS = [
  '#2563eb', '#16a34a', '#d97706', '#db2777', '#0891b2',
  '#7c3aed', '#dc2626', '#059669', '#ea580c', '#4f46e5',
  '#0d9488', '#c026d3', '#65a30d', '#e11d48', '#0284c7',
];

function TagsContent() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678/webhook';

  const fetchTags = async () => {
    try {
      const res = await fetch(`${N8N_URL}/admin/tags`);
      const data = await res.json();
      setTags(Array.isArray(data) ? data : data.tags || []);
    } catch (e) {
      console.error('Failed to fetch tags:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;

    setSaving(true);
    try {
      const res = await fetch(`${N8N_URL}/admin/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color: newTagColor }),
      });
      const data = await res.json();
      if (data.id) {
        setTags((prev) => [...prev, data]);
      } else {
        await fetchTags();
      }
      setNewTagName('');
      setNewTagColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    } catch (e) {
      console.error('Failed to add tag:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await fetch(`${N8N_URL}/admin/tags/${tagId}`, { method: 'DELETE' });
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (e) {
      console.error('Failed to delete tag:', e);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการแท็ก</h1>
        <p className="text-sm text-muted-foreground mt-1">
          เพิ่ม ลบ แท็กสำหรับติดป้ายกำกับบทสนทนา
        </p>
      </div>

      {/* Add Tag */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มแท็กใหม่
        </h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">ชื่อแท็ก</label>
            <Input
              placeholder="เช่น VIP, สนใจ, รอชำระ"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">สี</label>
            <div className="flex gap-1.5 flex-wrap max-w-[240px]">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: newTagColor === color ? '#1f2937' : 'transparent',
                    transform: newTagColor === color ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleAddTag} disabled={saving || !newTagName.trim()} className="h-10 gap-2">
            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            เพิ่ม
          </Button>
        </div>

        {/* Preview */}
        {newTagName.trim() && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">ตัวอย่าง:</span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: newTagColor }}
            >
              {newTagName.trim()}
            </span>
          </div>
        )}
      </Card>

      {/* Tags List */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          แท็กทั้งหมด ({tags.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            ยังไม่มีแท็ก กดเพิ่มแท็กใหม่ด้านบน
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                  {tag.scope && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {tag.scope}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function TagsPage() {
  return (
    <ProtectedLayout>
      <TagsContent />
    </ProtectedLayout>
  );
}
