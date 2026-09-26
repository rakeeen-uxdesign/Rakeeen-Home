/**
 * The single source for every icon in the app — one library (Hugeicons),
 * rendered with sharp (square cap / miter join) strokes to match the
 * brutalist design language, never the library's own rounded default.
 * Features import icons from here, never from '@hugeicons/*' directly —
 * that's what makes the library, the stroke width, and the sharp-vs-rounded
 * choice each a one-line edit (ICON_STROKE_WIDTH / ICON_STROKE_LINECAP /
 * ICON_STROKE_LINEJOIN below) instead of a find-and-replace across every
 * screen.
 *
 * Exceptions (not built through createIcon, but still import these same
 * constants rather than hardcoding their own): the Pomodoro focus ring
 * (src/features/focus/Pomodoro.tsx, scales with its own size), Recharts chart
 * internals, and the TouchID fingerprint glyph (a one-off animated scan
 * effect, not a reusable icon — but sharp-stroked like everything else).
 */
import React from 'react';
import {
  Refresh01Icon, Undo02Icon, PlusSignIcon, ArrowLeft01Icon, ArrowRight01Icon,
  Sun01Icon, Moon01Icon, Camera01Icon, MoreVerticalIcon, Logout04Icon,
  Money01Icon, Wallet01Icon, Delete02Icon, MinusSignIcon, PencilEdit01Icon,
  PlayIcon, PauseIcon, ArrowExpand01Icon, Cancel01Icon, LockIcon, Login03Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons';

/** The brutalist icon system: every icon in the app is built from these three
 *  constants. Change one here and it changes everywhere — including the
 *  hand-drawn exceptions listed below, which import these same constants
 *  instead of hardcoding their own numbers/keywords. */
export const ICON_STROKE_WIDTH = 2;
export const ICON_STROKE_LINECAP = 'square' as const;
export const ICON_STROKE_LINEJOIN = 'miter' as const;

type HugeIconData = [string, Record<string, unknown>][];

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

/** Renders a Hugeicons path set with sharp caps/joins instead of the library's rounded default. */
function createIcon(data: HugeIconData, displayName: string) {
  const Icon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {data.map(([tag, attrs], i) =>
        React.createElement(tag, {
          ...attrs,
          key: i,
          stroke: attrs.stroke ? color : undefined,
          strokeWidth: ICON_STROKE_WIDTH,
          strokeLinecap: ICON_STROKE_LINECAP,
          strokeLinejoin: ICON_STROKE_LINEJOIN,
        })
      )}
    </svg>
  );
  Icon.displayName = `Icon(${displayName})`;
  return Icon;
}

export const IconRotateCcw = createIcon(Refresh01Icon as HugeIconData, 'RotateCcw');
export const IconUndo2 = createIcon(Undo02Icon as HugeIconData, 'Undo2');
export const IconPlus = createIcon(PlusSignIcon as HugeIconData, 'Plus');
export const IconArrowLeft = createIcon(ArrowLeft01Icon as HugeIconData, 'ArrowLeft');
export const IconChevronRight = createIcon(ArrowRight01Icon as HugeIconData, 'ChevronRight');
export const IconSun = createIcon(Sun01Icon as HugeIconData, 'Sun');
export const IconMoon = createIcon(Moon01Icon as HugeIconData, 'Moon');
export const IconCamera = createIcon(Camera01Icon as HugeIconData, 'Camera');
export const IconMoreVertical = createIcon(MoreVerticalIcon as HugeIconData, 'MoreVertical');
export const IconLogOut = createIcon(Logout04Icon as HugeIconData, 'LogOut');
export const IconBanknote = createIcon(Money01Icon as HugeIconData, 'Banknote');
export const IconWallet = createIcon(Wallet01Icon as HugeIconData, 'Wallet');
export const IconTrash2 = createIcon(Delete02Icon as HugeIconData, 'Trash2');
export const IconMinus = createIcon(MinusSignIcon as HugeIconData, 'Minus');
export const IconPencil = createIcon(PencilEdit01Icon as HugeIconData, 'Pencil');
export const IconPlay = createIcon(PlayIcon as HugeIconData, 'Play');
export const IconPause = createIcon(PauseIcon as HugeIconData, 'Pause');
export const IconMaximize2 = createIcon(ArrowExpand01Icon as HugeIconData, 'Maximize2');
export const IconX = createIcon(Cancel01Icon as HugeIconData, 'X');
export const IconClose = createIcon(Cancel01Icon as HugeIconData, 'Close');
export const IconLock = createIcon(LockIcon as HugeIconData, 'Lock');
export const IconLogin = createIcon(Login03Icon as HugeIconData, 'Login');
export const IconChevronDown = createIcon(ArrowDown01Icon as HugeIconData, 'ChevronDown');
