'use client';

import { useEffect } from 'react';

import {
  getGuestPointerDragHoverTableId,
  subscribeGuestPointerDrag,
} from '@/lib/guest-pointer-drag';

/** Sincroniza el resaltado de mesa objetivo durante arrastre táctil. */
export function useGuestPointerDropHighlight(
  setDropTargetTableId: (tableId: string | null) => void,
) {
  useEffect(() => {
    return subscribeGuestPointerDrag(() => {
      setDropTargetTableId(getGuestPointerDragHoverTableId());
    });
  }, [setDropTargetTableId]);
}
