'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextArea,
} from '@heroui/react';
import { Loader2, Sparkles } from 'lucide-react';
import ObservatoryLogo from './ObservatoryLogo';
import SunsetStripeBand from './SunsetStripeBand';
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
import { OBSERVATORY_EXTRA_COPY } from '../lib/localized-telemetry';

interface AddMemoryModalProps {
  isOpen: boolean;
  existingCount: number;
  onClose: () => void;
  onAddMemory: (node: MemoryNode) => void;
  lang: LanguageCode;
  summarizeApiUrl?: string;
  assetBasePath?: string;
}

export default function AddMemoryModal({
  isOpen,
  existingCount,
  onClose,
  onAddMemory,
  lang,
  summarizeApiUrl = '/api/summarize',
  assetBasePath = '',
}: AddMemoryModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preferredCategory, setPreferredCategory] = useState<
    MemoryCategory | 'AUTO'
  >('AUTO');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = UI_STRINGS[lang];
  const extra = OBSERVATORY_EXTRA_COPY[lang];

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

  const categoryItems = [
    { key: 'AUTO', label: extra.aiAutoDetect },
    ...ALL_CATEGORIES.map((cat) => ({
      key: cat,
      label: t.categories[cat]?.label || cat,
    })),
  ];

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable
      className="bg-black/70 z-50"
    >
      <Modal.Container placement="center" size="lg" scroll="inside">
        {/* Mistral contact-form-panel: warm cream #FFF8E7, 12px radius, beige-deep border */}
        <Modal.Dialog
          aria-label={t.modalTitle}
          data-testid="add-memory-modal"
          className="mistral-editorial-light bg-[#FFF8E7] border border-[#E9DFC6] rounded-[12px] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.22)] max-w-[660px] w-full p-0 overflow-hidden text-[#111111]"
        >
          <SunsetStripeBand variant="hairline" />
          <Modal.CloseTrigger className="top-4 right-4 text-[#525252] hover:text-[#111111] hover:bg-[#FEF0C7] rounded-[8px]" />
          <Modal.Header className="px-7 pt-6 pb-4 border-b border-[#E9DFC6] flex flex-row items-center gap-3.5">
            <ObservatoryLogo size={36} assetBasePath={assetBasePath} />
            <div className="min-w-0 pr-6">
              <Modal.Heading
                id="add-memory-modal-title"
                className="font-display text-[24px] font-normal leading-[1.2] tracking-[-0.015em] text-[#111111] truncate"
              >
                {t.modalTitle}
              </Modal.Heading>
              <p className="text-[13px] font-normal text-[#525252] truncate mt-0.5">
                {t.modalSubtitle}
              </p>
            </div>
          </Modal.Header>

          <form id="add-memory-form" onSubmit={handleAnalyzeWithAI} suppressHydrationWarning>
            <Modal.Body className="px-7 py-6 space-y-5">
              {/* Quick Presets (cream-deeper 8px buttons) */}
              <div className="space-y-2">
                <span className="text-[12px] font-semibold text-[#525252]">
                  {t.modalPresetsLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {t.modalPresets.map((preset) => (
                    <Button
                      key={preset.label}
                      size="sm"
                      variant="outline"
                      onPress={() => {
                        setTitle(preset.title);
                        setContent(preset.content);
                        setPreferredCategory(preset.category);
                        setErrorMsg(null);
                      }}
                      className="h-8 rounded-[8px] px-3 bg-[#FFFFFF] hover:bg-[#FEF0C7] border-[#E9DFC6] text-[12px] font-medium text-[#111111]"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Name & Classification (44px white inputs, 8px radius, orange focus) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="memory-title-input"
                    className="text-[13px] font-medium text-[#262626]"
                  >
                    {t.modalNameLabel}
                  </Label>
                  <Input
                    id="memory-title-input"
                    placeholder={t.modalNamePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoComplete="off"
                    fullWidth
                    className="h-11 rounded-[8px] bg-[#FFFFFF] border border-[#D4CFC3] hover:border-[#A19F99] focus:border-[#FA500F] text-[14px] text-[#111111] placeholder:text-[#737373] px-3.5"
                  />
                </div>

                <Select
                  id="memory-category-select"
                  value={preferredCategory}
                  onChange={(key) => {
                    if (key !== null) {
                      setPreferredCategory(String(key) as MemoryCategory | 'AUTO');
                    }
                  }}
                  fullWidth
                  className="space-y-1.5"
                >
                  <Label className="text-[13px] font-medium text-[#262626]">
                    {t.modalCategoryLabel}
                  </Label>
                  <Select.Trigger className="h-11 rounded-[8px] bg-[#FFFFFF] border border-[#D4CFC3] hover:border-[#A19F99] focus:border-[#FA500F] text-[14px] text-[#111111] px-3.5">
                    <Select.Value />
                    <Select.Indicator className="text-[#525252]" />
                  </Select.Trigger>
                  <Select.Popover className="mistral-editorial-light bg-[#FFFFFF] border border-[#E5E0D5] rounded-[12px] p-1.5 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.12)]">
                    <ListBox>
                      {categoryItems.map((item) => (
                        <ListBox.Item
                          key={item.key}
                          id={item.key}
                          textValue={item.label}
                          className="rounded-[8px] px-3 py-2 text-[13px] text-[#262626] data-[hovered=true]:bg-[#FAF7F0] data-[selected=true]:bg-[#FFF8E7] data-[selected=true]:text-[#FA500F] data-[selected=true]:font-medium"
                        >
                          {item.label}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="memory-content-textarea"
                    className="text-[13px] font-medium text-[#262626]"
                  >
                    {t.modalDescLabel}
                  </Label>
                  <span className="text-[12px] font-mono tabular-nums text-[#737373]">
                    {content.trim().length} {t.modalCharCount}
                  </span>
                </div>
                <TextArea
                  id="memory-content-textarea"
                  aria-label={t.modalDescLabel}
                  rows={4}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder={t.modalDescPlaceholder}
                  fullWidth
                  className="rounded-[8px] bg-[#FFFFFF] border border-[#D4CFC3] hover:border-[#A19F99] focus:border-[#FA500F] text-[14px] text-[#111111] placeholder:text-[#737373] leading-relaxed p-3.5"
                />
              </div>

              {errorMsg && (
                <div className="rounded-[8px] bg-[#E10500]/10 border border-[#E10500]/35 px-4 py-2.5 text-[13px] text-[#B91C1C]">
                  {errorMsg}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="px-7 py-4 border-t border-[#E9DFC6] bg-[#FFFDF5]">
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[12px] text-[#737373]">{t.modalFooterNote}</p>

                <div className="flex items-center justify-end gap-2.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={onClose}
                    className="h-10 rounded-[8px] px-4 bg-[#FFFFFF] hover:bg-[#FAF7F0] border-[#D4CFC3] text-[13px] font-medium text-[#262626]"
                  >
                    {t.modalCancelBtn}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isDisabled={isLoading}
                    className="h-10 rounded-[8px] px-5 bg-[#FA500F] hover:bg-[#D93D04] text-white font-medium text-[13px] gap-1.5"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoading ? t.modalLoadingBtn : t.modalSubmitBtn}</span>
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
