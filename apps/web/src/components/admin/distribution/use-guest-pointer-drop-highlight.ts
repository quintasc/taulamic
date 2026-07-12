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

/** Variante por mesa (filas de lista de distribución). */
export function useGuestPointerDropHighlightForTable(
  tableId: string,
  setPointerDropActive: (active: boolean) => void,
) {
  useEffect(() => {
    return subscribeGuestPointerDrag(() => {
      setPointerDropActive(getGuestPointerDragHoverTableId() === tableId);
    });
  }, [setPointerDropActive, tableId]);
}
