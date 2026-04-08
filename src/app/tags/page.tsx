'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tag, Plus, Trash2, Loader, FolderOpen, Edit2, X } from 'lucide-react';
import { tagsAPI } from '@/lib/api';

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

// Default scope labels
const DEFAULT_SCOPES: Record<string, string> = {
  global: 'ทั่วไป',
  customer: 'ลูกค้า',
  conversation: 'บทสนทนา',
};

const loadCustomScopes = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('custom_scopes') || '{}');
  } catch { return {}; }
};

const saveCustomScopes = (scopes: Record<string, string>) => {
  localStorage.setItem('custom_scopes', JSON.stringify(scopes));
};

function TagsContent() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [newTagCategory, setNewTagCategory] = useState('global');
  const [hexInput, setHexInput] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [customScopes, setCustomScopes] = useState<Record<string, string>>({});
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [newCategoryKey, setNewCategoryKey] = useState('');

  // All scopes = default + custom
  const allScopes = { ...DEFAULT_SCOPES, ...customScopes };
  const allScopeKeys = Object.keys(allScopes);
  const scopeLabel = (key: string) => allScopes[key] || key;

  useEffect(() => {
    setCustomScopes(loadCustomScopes());
  }, []);

  const fetchTags = async () => {
    try {
      const data = await tagsAPI.getAll();
      const items: TagItem[] = (Array.isArray(data) ? data : []).map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        scope: t.scope || 'global',
      }));
      setTags(items);
    } catch (e) {
      console.error('Failed to fetch tags:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleColorChange = (color: string) => {
    setNewTagColor(color);
    setHexInput(color);
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setNewTagColor(val);
    }
  };

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase() && t.scope === newTagCategory)) return;

    setSaving(true);
    try {
      const data = await tagsAPI.create(name, newTagColor, newTagCategory);
      if (data?.id) {
        setTags((prev) => [...prev, { id: data.id, name: data.name, color: data.color, scope: data.scope || newTagCategory }]);
      } else {
        await fetchTags();
      }
      setNewTagName('');
      setNewTagColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setHexInput(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    } catch (e) {
      console.error('Failed to add tag:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await tagsAPI.delete(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (e) {
      console.error('Failed to delete tag:', e);
    }
  };

  const filteredTags = filterCategory === 'all'
    ? tags
    : tags.filter((t) => t.scope === filterCategory);

  const categoryTagCounts = allScopeKeys.reduce((acc, cat) => {
    acc[cat] = tags.filter((t) => (t.scope || 'global') === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const handleAddCategory = () => {
    const name = newCategoryKey.trim();
    if (!name) return;
    // Use lowercase key
    const key = name.toLowerCase().replace(/\s+/g, '_');
    if (allScopes[key]) return; // already exists
    const updated = { ...customScopes, [key]: name };
    setCustomScopes(updated);
    saveCustomScopes(updated);
    setNewCategoryKey('');
  };

  const handleDeleteCategory = (key: string) => {
    if (DEFAULT_SCOPES[key]) return; // can't delete default
    const updated = { ...customScopes };
    delete updated[key];
    setCustomScopes(updated);
    saveCustomScopes(updated);
    if (filterCategory === key) setFilterCategory('all');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการแท็ก</h1>
        <p className="text-sm text-muted-foreground mt-1">
          เพิ่ม ลบ แท็กสำหรับติดป้ายกำกับบทสนทนา แบ่งตามหมวดหมู่
        </p>
      </div>

      {/* Add Tag */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มแท็กใหม่
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ชื่อแท็ก</label>
              <Input
                placeholder="เช่น VIP, สนใจ, รอชำระ"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
                }}
                className="h-10"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">หมวดหมู่</label>
              <select
                value={newTagCategory}
                onChange={(e) => setNewTagCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {allScopeKeys.map((key) => (
                  <option key={key} value={key}>{scopeLabel(key)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">สี</label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: newTagColor === color ? '#1f2937' : 'transparent',
                      transform: newTagColor === color ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                  className="h-8 w-24 text-xs font-mono"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Preview */}
            {newTagName.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">ตัวอย่าง:</span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: newTagColor }}
                >
                  {newTagName.trim()}
                </span>
              </div>
            )}
            <Button onClick={handleAddTag} disabled={saving || !newTagName.trim()} className="h-10 gap-2 ml-auto">
              {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              เพิ่มแท็ก
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter by category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === 'all' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              ทั้งหมด ({tags.length})
            </button>
            {allScopeKeys.map((key) => (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterCategory === key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {scopeLabel(key)} ({categoryTagCounts[key] || 0})
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCategoryEditor(!showCategoryEditor)}
            className={`p-1.5 rounded-lg transition-colors ${
              showCategoryEditor ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
            }`}
            title="จัดการหมวดหมู่"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        {showCategoryEditor && (
          <Card className="p-4 border-dashed">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              จัดการหมวดหมู่
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {allScopeKeys.map((key) => {
                const isDefault = !!DEFAULT_SCOPES[key];
                const usedCount = tags.filter((t) => t.scope === key).length;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                  >
                    {scopeLabel(key)}
                    {usedCount > 0 && (
                      <span className="text-[10px] text-muted-foreground/60">({usedCount})</span>
                    )}
                    {!isDefault && (
                      <button
                        onClick={() => handleDeleteCategory(key)}
                        className="hover:text-red-500 transition-colors"
                        title="ลบหมวดหมู่"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCategoryKey}
                onChange={(e) => setNewCategoryKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); }}}
                placeholder="ชื่อหมวดหมู่ใหม่..."
                className="h-8 text-xs flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 gap-1 text-xs"
                onClick={handleAddCategory}
                disabled={!newCategoryKey.trim()}
              >
                <Plus className="h-3 w-3" />
                เพิ่ม
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Tags List */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          แท็ก ({filteredTags.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {tags.length === 0 ? 'ยังไม่มีแท็ก กดเพิ่มแท็กใหม่ด้านบน' : 'ไม่มีแท็กในหมวดหมู่นี้'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTags.map((tag) => (
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
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                    <FolderOpen className="h-2.5 w-2.5" />
                    {scopeLabel(tag.scope || 'global')}
                  </span>
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
