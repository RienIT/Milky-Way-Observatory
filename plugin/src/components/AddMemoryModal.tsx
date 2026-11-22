'use client';

import React, { useState } from 'react';
import { Loader2, Sparkles, Telescope, X } from 'lucide-react';
import {
  ALL_CATEGORIES,
  MemoryCategory,
  MemoryNode,
} from '../lib/memory-types';
import {
  generateOrbitalParameters,
  localFallbackSummarize,
} from '../lib/memory-logic';
import { LanguageCode, UI_STRINGS } from '../lib/i18n';

interface AddMemoryModalProps {
  isOpen: boolean;
  existingCount: number;
  onClose: () => void;
  onAddMemory: (node: MemoryNode) => void;
  lang: LanguageCode;
  summarizeApiUrl?: string;
}

export default function AddMemoryModal({
  isOpen,
  existingCount,
  onClose,
  onAddMemory,
  lang,
  summarizeApiUrl = '/api/summarize',
}: AddMemoryModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preferredCategory, setPreferredCategory] = useState<
    MemoryCategory | 'AUTO'
  >('AUTO');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = UI_STRINGS[lang];

  if (!isOpen) return null;

  const createNodeFromSummary = (result: {
    title: string;
    category: MemoryCategory;
    summary: [string, string, string];
    tags: string[];
  }) => {
    const orbital = generateOrbitalParameters(existingCount);
    const today = new Date().toISOString().slice(0, 10);

    const newNode: MemoryNode = {
      id: `astro-custom-${Date.now()}`,
      title: result.title,
      category:
        preferredCategory === 'AUTO' ? result.category : preferredCategory,
      summary: result.summary,
      tags: result.tags,
      content: content.trim(),
      createdAt: today,
      ...orbital,
    };

    onAddMemory(newNode);
    setTitle('');
    setContent('');
    setPreferredCategory('AUTO');
    setErrorMsg(null);
    onClose();
  };

  const handleAnalyzeWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = content.trim();
    if (trimmed.length < 12) {
      setErrorMsg(t.modalErrorMinChars);
      return;
    }

    setIsLoading(true);
    if (!summarizeApiUrl) {
      createNodeFromSummary(
        localFallbackSummarize(
          trimmed,
          title.trim(),
          preferredCategory === 'AUTO' ? undefined : preferredCategory
        )
      );
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(summarizeApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: trimmed,
          language: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const localRes = localFallbackSummarize(
          trimmed,
          title.trim(),
          preferredCategory === 'AUTO' ? undefined : preferredCategory
        );
        createNodeFromSummary(localRes);
        return;
      }

      createNodeFromSummary({
        title: data.title,
        category: data.category,
        summary: data.summary,
        tags: data.tags,
      });
    } catch {
      const localRes = localFallbackSummarize(
        trimmed,
        title.trim(),
        preferredCategory === 'AUTO' ? undefined : preferredCategory
      );
      createNodeFromSummary(localRes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-memory-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
    >
      <div className="w-full max-w-2xl rounded-[4px] bg-[#0a0c10] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-[2px] bg-[#E88B38]/15 border border-[#E88B38]/35 text-[#E88B38] inline-flex items-center justify-center shrink-0">
              <Telescope className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2
                id="add-memory-modal-title"
                className="text-[15px] font-semibold tracking-[-0.015em] text-[#ECEAE4] truncate"
              >
                {t.modalTitle}
              </h2>
              <p className="text-xs text-[#8A8D96] truncate mt-0.5">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeInspector}
            className="p-1.5 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleAnalyzeWithAI}
          suppressHydrationWarning
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#8A8D96]">
              {t.modalPresetsLabel}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {t.modalPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setTitle(preset.title);
                    setContent(preset.content);
                    setPreferredCategory(preset.category);
                    setErrorMsg(null);
                  }}
                  className="px-3 py-1.5 rounded-[2px] bg-white/[0.04] hover:bg-[#E88B38]/14 border border-white/[0.09] hover:border-[#E88B38]/40 text-xs font-medium text-[#E88B38] transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="memory-title-input"
                className="block text-xs font-medium text-[#C8C6C0]"
              >
                {t.modalNameLabel}
              </label>
              <input
                id="memory-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.modalNamePlaceholder}
                autoComplete="off"
                suppressHydrationWarning
                className="w-full rounded-[2px] bg-[#12151c] border border-white/[0.10] px-3.5 py-2 text-sm text-[#ECEAE4] placeholder:text-[#6B707B] focus:outline-none focus:border-[#E88B38] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="memory-category-select"
                className="block text-xs font-medium text-[#C8C6C0]"
              >
                {t.modalCategoryLabel}
              </label>
              <select
                id="memory-category-select"
                value={preferredCategory}
                onChange={(e) =>
                  setPreferredCategory(
                    e.target.value as MemoryCategory | 'AUTO'
                  )
                }
                suppressHydrationWarning
                className="w-full rounded-[2px] bg-[#12151c] border border-white/[0.10] px-3.5 py-2 text-sm text-[#ECEAE4] focus:outline-none focus:border-[#E88B38] transition-colors"
              >
                <option value="AUTO">AI Auto-Detect</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.categories[cat]?.label || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="memory-content-textarea"
                className="block text-xs font-medium text-[#C8C6C0]"
              >
                {t.modalDescLabel}
              </label>
              <span className="text-xs font-mono tabular-nums text-[#6B707B]">
                {content.trim().length} {t.modalCharCount}
              </span>
            </div>
            <textarea
              id="memory-content-textarea"
              rows={5}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={t.modalDescPlaceholder}
              suppressHydrationWarning
              className="w-full rounded-[2px] bg-[#12151c] border border-white/[0.10] px-3.5 py-2.5 text-sm text-[#ECEAE4] placeholder:text-[#6B707B] focus:outline-none focus:border-[#E88B38] transition-colors resize-none leading-relaxed"
            />
          </div>

          {errorMsg && (
            <div className="rounded-[2px] bg-rose-500/10 border border-rose-500/40 px-4 py-2.5 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08]">
            <p className="text-[11px] text-[#6B707B]">{t.modalFooterNote}</p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[2px] bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-medium text-[#C8C6C0] transition-colors"
              >
                {t.modalCancelBtn}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] bg-[#E88B38] hover:bg-[#f09b4e] disabled:opacity-60 text-[#050608] font-semibold text-xs sm:text-sm transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.modalLoadingBtn}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.modalSubmitBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
