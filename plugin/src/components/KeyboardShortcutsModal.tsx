'use client';

import React from 'react';
import { Kbd } from '@heroui/react';
import { Keyboard } from 'lucide-react';
import ObservatoryModalShell from './ObservatoryModalShell';
import { LanguageCode } from '../lib/i18n';

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
  return (
    <ObservatoryModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={MODAL_TITLE[lang]}
      testId="shortcuts-modal-dialog"
      theme="dark"
      maxWidthClass="max-w-[540px]"
    >
      <div className="px-5 py-4 pr-12 border-b border-[#FFF8E7]/10 flex flex-row items-center gap-2.5 shrink-0">
        <Keyboard className="w-4 h-4 text-[#FA500F] shrink-0 block" />
        <h2 className="font-display text-[20px] font-normal text-[#FFF8E7]">
          {MODAL_TITLE[lang]}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#FFF8E7]/[0.07]">
        {SHORTCUT_ROWS.map((row) => (
          <div
            key={row.keys.join('-')}
            className="px-5 py-3 flex items-center justify-between gap-4"
          >
            <span className="text-[13px] text-[#D6D3CB]">{row.label[lang]}</span>
            <div className="flex items-center gap-1 shrink-0">
              {row.keys.map((k) => (
                <Kbd
                  key={k}
                  className="px-2 py-0.5 rounded-[4px] border border-[#FFF8E7]/16 bg-[#FFF8E7]/[0.07] font-mono text-[11px] text-[#FFF8E7] shadow-none"
                >
                  <Kbd.Content>{k}</Kbd.Content>
                </Kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ObservatoryModalShell>
  );
}
