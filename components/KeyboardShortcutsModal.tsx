'use client';

import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { LanguageCode } from '@/lib/i18n';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

interface ShortcutRow {
  keys: string[];
  label: Record<LanguageCode, string>;
}

const SHORTCUT_ROWS: readonly ShortcutRow[] = [
  {
    keys: ['/', '⌘K'],
    label: {
      en: 'Open Command Palette (catalog, galaxies, eclipses, tours)',
      vi: 'Mở Command Palette (thiên thể, thiên hà, nhật thực, tour)',
      ja: 'コマンドパレットを開く（天体・銀河・日食・ツアー）',
      zh: '打开命令面板（星表、星系、日食、导览）',
      ko: '명령 팔레트 열기 (천체, 은하, 일식, 투어)',
    },
  },
  {
    keys: ['H'],
    label: {
      en: 'Toggle Cinema / Telescope Mode (hide all HUD)',
      vi: 'Bật/tắt Chế độ Kính thiên văn (ẩn toàn bộ HUD)',
      ja: 'シネマ / 望遠鏡モード切替（HUD全非表示）',
      zh: '切换望远镜纯净模式（隐藏全部 HUD）',
      ko: '시네마 / 망원경 모드 전환 (전체 HUD 숨기기)',
    },
  },
  {
    keys: ['W', 'A', 'S', 'D'],
    label: {
      en: '6-DOF Free-Flight horizontal movement',
      vi: 'Bay tự do 6 bậc tự do (tiến / lùi / trái / phải)',
      ja: '6自由度フリーフライト水平移動',
      zh: '六自由度自由飞行水平移动',
      ko: '6자유도 자유 비행 수평 이동',
    },
  },
  {
    keys: ['Q', 'E', 'Shift'],
    label: {
      en: 'Ascend / Descend vertically · Hold Shift for 3.2× boost',
      vi: 'Nâng / Hạ độ cao · Giữ Shift tăng tốc 3,2×',
      ja: '垂直上昇・下降 · Shift長押しで3.2倍加速',
      zh: '垂直升降 · 按住 Shift 获得 3.2× 加速',
      ko: '수직 상승/하강 · Shift 유지 시 3.2× 가속',
    },
  },
  {
    keys: ['Scroll', 'Drag'],
    label: {
      en: 'Logarithmic continuous zoom (1 m → 100 Mpc) · Orbit / Right-drag pan',
      vi: 'Thu phóng logarit liên tục (1 m → 100 Mpc) · Xoay / Chuột phải dịch chuyển',
      ja: '対数連続ズーム (1 m → 100 Mpc) · 回転 / 右ドラッグ平行移動',
      zh: '对数连续缩放 (1 m → 100 Mpc) · 旋转 / 右键平移',
      ko: '로그 연속 줌 (1 m → 100 Mpc) · 회전 / 우클릭 이동',
    },
  },
  {
    keys: ['←', '→'],
    label: {
      en: 'Step Previous / Next chapter during a Guided Expedition',
      vi: 'Chuyển chặng Trước / Tiếp theo trong Chuyến thám hiểm',
      ja: 'ガイドツアー中の前後チャプター移動',
      zh: '在科学导览中切换上一站 / 下一站',
      ko: '가이드 투어 중 이전 / 다음 챕터 이동',
    },
  },
  {
    keys: ['?'],
    label: {
      en: 'Show / hide this Keyboard Shortcuts reference',
      vi: 'Mở / đóng bảng Phím tắt Đài quan sát',
      ja: 'キーボードショートカット一覧の表示切替',
      zh: '打开 / 关闭快捷键参考面板',
      ko: '단축키 안내 창 열기 / 닫기',
    },
  },
];

const MODAL_TITLE: Record<LanguageCode, string> = {
  en: 'Observatory Controls & Shortcuts',
  vi: 'Điều khiển & Phím tắt Đài quan sát',
  ja: '天文台コントロール＆ショートカット',
  zh: '天文台控制与快捷键',
  ko: '천문대 조작 및 단축키',
};

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
  lang,
}: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="shortcuts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={MODAL_TITLE[lang]}
        data-testid="shortcuts-modal-dialog"
        className="w-full max-w-[520px] rounded-[4px] bg-[#0a0c10] border border-white/[0.14] shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-white/[0.09] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#E88B38]" />
            <h2 className="text-[13px] font-semibold text-[#ECEAE4]">
              {MODAL_TITLE[lang]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-[2px] text-[#8A8D96] hover:text-[#ECEAE4] hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {SHORTCUT_ROWS.map((row) => (
            <div
              key={row.keys.join('-')}
              className="px-4 py-2.5 flex items-center justify-between gap-4"
            >
              <span className="text-[12px] text-[#C8C6C0]">{row.label[lang]}</span>
              <div className="flex items-center gap-1 shrink-0">
                {row.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 rounded-[2px] border border-white/[0.14] bg-white/[0.05] font-mono text-[10px] text-[#ECEAE4]"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
