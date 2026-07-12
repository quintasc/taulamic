import type { DistributionProposal, GuestView } from '@/lib/api';
import {
  parseApproximateGuestCount,
  type EventUiMeta,
} from '@/lib/event-ui-meta';
import {
  FLOOR_PLAN_ACCESSORIES,
  computeTableGridLayout,
  computeTableLayoutInsets,
  formatRoomDimensions,
  resolveAccessoryLayouts,
  roomPixelSize,
  type FloorPlanSetup,
} from '@/lib/floor-plan-setup';
import {
  TABLE_DIAGRAM,
  getDiagramSeatPositions,
} from '@/lib/distribution-table-diagram-layout';
import { getCategoryColor, type CategoryColor } from '@/lib/category-colors';
import type { DistributionTableGroup } from '@/lib/distribution-view';
import type { jsPDF } from 'jspdf';

type LayoutPosition = { x: number; y: number };
type ProposalPlacement = DistributionProposal['placements'][number];
type SeatMap = Record<string, ProposalPlacement | undefined>;
type PdfRect = { x: number; y: number; width: number; height: number };
type GuestAffinityRelation = NonNullable<EventUiMeta['affinityRelations']>[number];
type CategoryAffinityRelation = NonNullable<
  EventUiMeta['categoryAffinityRelations']
>[number];
type RelationIconKind =
  | 'guest-affinity'
  | 'guest-incompatibility'
  | 'category-affinity'
  | 'category-incompatibility';
type TableRelationItem = {
  kind: RelationIconKind;
  label: string;
  guestAId?: string;
  guestBId?: string;
};
type RelationSummaryRow = { text: string; kind: RelationIconKind };
type CategoryDispersionItem = {
  name: string;
  guestCount: number;
  tableCount: number;
};
type TableCategoryCount = { name: string; count: number };
type CompanionGroupInput = { guestIds: string[]; keepTogether: boolean };
type CoupleSummary = {
  totalCouples: number;
  togetherCouples: number;
  separatedCouples: number;
  unassignedCouples: number;
  allTogether: boolean;
};

export type DownloadDistributionReportPdfInput = {
  eventName: string;
  eventMeta: EventUiMeta;
  guests: GuestView[];
  companionGroups?: CompanionGroupInput[];
  guestTotal: number;
  proposal: DistributionProposal;
  tableGroups: DistributionTableGroup[];
  roomSetup: FloorPlanSetup;
  customLayoutPositions: Record<string, LayoutPosition>;
};

type MarkerStatus = DistributionTableGroup['status'];

const COLOR_PRIMARY: [number, number, number] = [232, 107, 74];
const COLOR_PRIMARY_SOFT: [number, number, number] = [253, 236, 232];
const COLOR_TEXT: [number, number, number] = [26, 26, 26];
const COLOR_MUTED: [number, number, number] = [74, 74, 74];
const COLOR_BORDER: [number, number, number] = [232, 232, 232];
const COLOR_CANVAS: [number, number, number] = [248, 248, 248];
const COLOR_EMPTY_SEAT: [number, number, number] = [241, 241, 241];
const COLOR_EMPTY_SEAT_TEXT: [number, number, number] = [138, 138, 138];
const EXCLUDED_CATEGORY_NAMES = new Set(['pareja', 'parejas']);
const TAULAMIC_LOGO_ICON_URL = '/taulamic-logo.png';
const TAULAMIC_WORDMARK_URL = '/taulamic-wordmark.png';

type PdfHeaderContext = {
  eventName: string;
  subtitle: string;
  logoDataUrl?: string | null;
  wordmarkDataUrl?: string | null;
};

const cachedBrandImageDataUrls: {
  logoIcon: string | null | undefined;
  wordmark: string | null | undefined;
} = {
  logoIcon: undefined,
  wordmark: undefined,
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim().replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return COLOR_MUTED;
  }
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  if (![red, green, blue].every(Number.isFinite)) {
    return COLOR_MUTED;
  }
  return [red, green, blue];
}

function resolveCategoryPalette(
  categoryName: string | undefined | null,
  options?: { presidential?: boolean; empty?: boolean },
): CategoryColor {
  return getCategoryColor(categoryName, options);
}

function categoryPaletteToRgb(
  categoryName: string | undefined | null,
  options?: { presidential?: boolean; empty?: boolean },
): {
  fill: [number, number, number];
  border: [number, number, number];
  text: [number, number, number];
} {
  const palette = resolveCategoryPalette(categoryName, options);
  return {
    fill: hexToRgb(palette.fill),
    border: hexToRgb(palette.border),
    text: hexToRgb(palette.text),
  };
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const rounded = Math.round(value * 10) / 10;
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded));
  }
  return rounded.toFixed(1).replace('.', ',');
}

function compareTableLabels(left: string, right: string): number {
  return left.localeCompare(right, 'es', {
    numeric: true,
    sensitivity: 'base',
  });
}

function tableStatusLabel(group: DistributionTableGroup): string {
  if (group.assignedCount <= 0) {
    return 'Vacía';
  }
  if (group.assignedCount > group.capacity) {
    return 'Sobrecapacidad';
  }
  if (group.assignedCount >= group.capacity) {
    return 'Completa';
  }
  return 'Parcial';
}

function buildGuestNameById(input: DownloadDistributionReportPdfInput): Map<string, string> {
  const map = new Map<string, string>();
  input.guests.forEach((guest) => {
    map.set(guest.id, guest.nombre);
  });
  input.proposal.placements.forEach((placement) => {
    if (!map.has(placement.guestId)) {
      map.set(placement.guestId, placement.guestName);
    }
  });
  return map;
}

function buildGuestPrimaryCategoryById(
  input: DownloadDistributionReportPdfInput,
): Map<string, string> {
  const map = new Map<string, string>();
  input.guests.forEach((guest) => {
    const primary = (guest.categories ?? [])
      .map((category) => category.name.trim())
      .find(
        (name) => Boolean(name) && !EXCLUDED_CATEGORY_NAMES.has(name.toLowerCase()),
      );
    if (primary) {
      map.set(guest.id, primary);
    }
  });
  input.tableGroups.forEach((group) => {
    group.guests.forEach((guest) => {
      if (map.has(guest.guestId)) {
        return;
      }
      const primary = (guest.categoryNames ?? [])
        .map((name) => name.trim())
        .find(
          (name) => Boolean(name) && !EXCLUDED_CATEGORY_NAMES.has(name.toLowerCase()),
        );
      if (primary) {
        map.set(guest.guestId, primary);
      }
    });
  });
  return map;
}

function buildCategoryDispersion(
  input: DownloadDistributionReportPdfInput,
): CategoryDispersionItem[] {
  const guestTableById = new Map<string, string>();
  input.proposal.placements.forEach((placement) => {
    guestTableById.set(placement.guestId, placement.tableId);
  });

  const statsByCategory = new Map<
    string,
    { guestCount: number; tableIds: Set<string> }
  >();
  const register = (categoryName: string, tableId?: string): void => {
    const normalized = categoryName.trim();
    if (!normalized) {
      return;
    }
    const current = statsByCategory.get(normalized) ?? {
      guestCount: 0,
      tableIds: new Set<string>(),
    };
    current.guestCount += 1;
    if (tableId) {
      current.tableIds.add(tableId);
    }
    statsByCategory.set(normalized, current);
  };

  input.guests.forEach((guest) => {
    const categories = [
      ...new Set(
        (guest.categories ?? [])
          .map((category) => category.name.trim())
          .filter(
            (categoryName) =>
              Boolean(categoryName) &&
              !EXCLUDED_CATEGORY_NAMES.has(categoryName.toLowerCase()),
          ),
      ),
    ];
    const assignedTableId = guestTableById.get(guest.id);
    if (categories.length === 0) {
      register('Sin categoría', assignedTableId);
      return;
    }
    categories.forEach((category) => register(category, assignedTableId));
  });

  if (statsByCategory.size === 0) {
    input.tableGroups.forEach((group) => {
      group.guests.forEach((guest) => {
        const categories = (guest.categoryNames ?? []).filter(
          (categoryName) =>
            Boolean(categoryName) &&
            !EXCLUDED_CATEGORY_NAMES.has(categoryName.toLowerCase()),
        );
        if (categories.length === 0) {
          register('Sin categoría', group.tableId);
          return;
        }
        [...new Set(categories)].forEach((category) =>
          register(category, group.tableId),
        );
      });
    });
  }

  return [...statsByCategory.entries()]
    .map(([name, value]) => ({
      name,
      guestCount: value.guestCount,
      tableCount: value.tableIds.size,
    }))
    .sort((left, right) => {
      if (right.guestCount !== left.guestCount) {
        return right.guestCount - left.guestCount;
      }
      return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
    });
}

function buildTableCategoryCounts(group: DistributionTableGroup): TableCategoryCount[] {
  const counts = new Map<string, number>();
  group.guests.forEach((guest) => {
    const categories = (guest.categoryNames ?? []).filter(
      (categoryName) =>
        Boolean(categoryName) &&
        !EXCLUDED_CATEGORY_NAMES.has(categoryName.toLowerCase()),
    );
    if (categories.length === 0) {
      counts.set('Sin categoría', (counts.get('Sin categoría') ?? 0) + 1);
      return;
    }
    [...new Set(categories)].forEach((category) => {
      const normalized = category.trim();
      if (!normalized) {
        return;
      }
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
    });
}

function buildCoupleSummary(input: DownloadDistributionReportPdfInput): CoupleSummary {
  const uniquePairs = new Map<string, [string, string]>();
  const registerPair = (guestA: string, guestB: string): void => {
    const left = guestA.trim();
    const right = guestB.trim();
    if (!left || !right || left === right) {
      return;
    }
    const ordered = [left, right].sort();
    const key = `${ordered[0]}|${ordered[1]}`;
    if (!uniquePairs.has(key)) {
      uniquePairs.set(key, [ordered[0], ordered[1]]);
    }
  };

  const hasCompanionGroups = (input.companionGroups?.length ?? 0) > 0;
  if (hasCompanionGroups) {
    (input.companionGroups ?? []).forEach((group) => {
      if (group.guestIds.length !== 2) {
        return;
      }
      registerPair(group.guestIds[0] ?? '', group.guestIds[1] ?? '');
    });
  } else {
    const guestsByCompanionKey = new Map<string, string[]>();
    input.guests.forEach((guest) => {
      const companionKey = guest.acompananteKey?.trim();
      if (!companionKey) {
        return;
      }
      const list = guestsByCompanionKey.get(companionKey) ?? [];
      list.push(guest.id);
      guestsByCompanionKey.set(companionKey, list);
    });
    guestsByCompanionKey.forEach((guestIds) => {
      if (guestIds.length !== 2) {
        return;
      }
      registerPair(guestIds[0] ?? '', guestIds[1] ?? '');
    });
  }

  const tableByGuestId = new Map<string, string>();
  input.proposal.placements.forEach((placement) => {
    tableByGuestId.set(placement.guestId, placement.tableId);
  });

  let togetherCouples = 0;
  let separatedCouples = 0;
  let unassignedCouples = 0;
  uniquePairs.forEach(([guestA, guestB]) => {
    const tableA = tableByGuestId.get(guestA);
    const tableB = tableByGuestId.get(guestB);
    if (!tableA || !tableB) {
      unassignedCouples += 1;
      return;
    }
    if (tableA === tableB) {
      togetherCouples += 1;
      return;
    }
    separatedCouples += 1;
  });

  const totalCouples = uniquePairs.size;
  const allTogether =
    totalCouples > 0 && separatedCouples === 0 && unassignedCouples === 0;
  return {
    totalCouples,
    togetherCouples,
    separatedCouples,
    unassignedCouples,
    allTogether,
  };
}

function formatTableList(groups: DistributionTableGroup[], max = 5): string {
  if (groups.length === 0) {
    return '';
  }
  const labels = groups.map((group) => group.tableLabel).slice(0, max);
  const suffix = groups.length > max ? ` y ${groups.length - max} más` : '';
  return `${labels.join(', ')}${suffix}`;
}

function buildOperationalHighlights(groups: DistributionTableGroup[]): string[] {
  const overCapacity = groups.filter((group) => group.assignedCount > group.capacity);
  const empty = groups.filter((group) => group.assignedCount === 0);
  const lowUsage = groups.filter(
    (group) =>
      group.assignedCount > 0 &&
      group.assignedCount <= Math.max(2, Math.floor(group.capacity * 0.5)),
  );
  const stable = groups.filter(
    (group) =>
      group.assignedCount >= group.capacity &&
      (group.tableAffinity?.percent ?? 0) >= 95,
  );
  const highlights: string[] = [];

  if (overCapacity.length > 0) {
    highlights.push(
      `${overCapacity.length} mesa(s) en sobrecapacidad: ${formatTableList(overCapacity)}.`,
    );
  }
  if (empty.length > 0) {
    highlights.push(`${empty.length} mesa(s) vacía(s): ${formatTableList(empty)}.`);
  }
  if (lowUsage.length > 0) {
    highlights.push(`Baja ocupación en: ${formatTableList(lowUsage)}.`);
  }
  if (stable.length > 0) {
    highlights.push(`Mesas estables y completas: ${formatTableList(stable)}.`);
  }

  if (overCapacity.length > 0) {
    const overflowGuests = overCapacity.reduce(
      (acc, group) => acc + Math.max(0, group.assignedCount - group.capacity),
      0,
    );
    highlights.push(
      `Recomendación: reubicar al menos ${overflowGuests} invitado(s) desde mesas en sobrecapacidad.`,
    );
  } else if (empty.length > 0) {
    highlights.push(
      'Recomendación: evaluar compactación de mesas para reducir dispersión operativa.',
    );
  } else if (highlights.length === 0) {
    highlights.push('Distribución equilibrada sin incidencias operativas destacables.');
  }

  return highlights;
}

function normalizeRelationKey(left: string, right: string): string {
  return [left.trim().toLowerCase(), right.trim().toLowerCase()].sort().join('|');
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function resolveGuestRelationLabel(
  guestRef: string,
  guestNameById: Map<string, string>,
): string {
  const normalizedRef = guestRef.trim();
  const byId = guestNameById.get(normalizedRef);
  if (byId?.trim()) {
    return byId.trim();
  }
  if (!looksLikeUuid(normalizedRef)) {
    return normalizedRef || 'Invitado';
  }
  const shortRef = normalizedRef.slice(0, 8);
  return `Invitado ${shortRef}`;
}

function buildTableRelationItems(
  relations: GuestAffinityRelation[],
  categoryRelations: CategoryAffinityRelation[],
  tableGuestIds: Set<string>,
  tableCategories: Set<string>,
  guestNameById: Map<string, string>,
  tableGuestIdByNormalizedName: Map<string, string>,
): TableRelationItem[] {
  const dedupe = new Set<string>();
  const items: TableRelationItem[] = [];
  const normalizedCategories = new Set(
    [...tableCategories].map((category) => category.trim().toLowerCase()),
  );

  relations.forEach((relation) => {
    const guestARef = relation.guestA.trim();
    const guestBRef = relation.guestB.trim();
    const guestAId = tableGuestIds.has(guestARef)
      ? guestARef
      : tableGuestIdByNormalizedName.get(guestARef.toLowerCase());
    const guestBId = tableGuestIds.has(guestBRef)
      ? guestBRef
      : tableGuestIdByNormalizedName.get(guestBRef.toLowerCase());
    if (!guestAId || !guestBId) {
      return;
    }
    const guestA = resolveGuestRelationLabel(relation.guestA, guestNameById);
    const guestB = resolveGuestRelationLabel(relation.guestB, guestNameById);
    const key = `${relation.type}:${normalizeRelationKey(
      guestAId,
      guestBId,
    )}`;
    if (dedupe.has(key)) {
      return;
    }
    dedupe.add(key);
    items.push({
      kind:
        relation.type === 'afinidad'
          ? 'guest-affinity'
          : 'guest-incompatibility',
      label: `${shortGuestName(guestA)} · ${shortGuestName(guestB)}`,
      guestAId,
      guestBId,
    });
  });

  categoryRelations.forEach((relation) => {
    const categoryA = relation.categoryA.trim().toLowerCase();
    const categoryB = relation.categoryB.trim().toLowerCase();
    if (
      !normalizedCategories.has(categoryA) ||
      !normalizedCategories.has(categoryB)
    ) {
      return;
    }
    const key = `${relation.type}:${normalizeRelationKey(
      relation.categoryA,
      relation.categoryB,
    )}`;
    if (dedupe.has(key)) {
      return;
    }
    dedupe.add(key);
    items.push({
      kind:
        relation.type === 'afinidad'
          ? 'category-affinity'
          : 'category-incompatibility',
      label: `${relation.categoryA} · ${relation.categoryB}`,
    });
  });

  return items;
}

function formatMetaDate(dateIso?: string): string {
  if (!dateIso?.trim()) {
    return '—';
  }
  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateIso?: string | null): string {
  if (!dateIso) {
    return '—';
  }
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('No se pudo convertir la imagen del logo.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Error leyendo logo.'));
    reader.readAsDataURL(blob);
  });
}

async function loadBrandImageDataUrl(
  imageUrl: string,
  key: keyof typeof cachedBrandImageDataUrls,
): Promise<string | null> {
  if (cachedBrandImageDataUrls[key] !== undefined) {
    return cachedBrandImageDataUrls[key];
  }
  if (typeof window === 'undefined') {
    cachedBrandImageDataUrls[key] = null;
    return null;
  }
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      cachedBrandImageDataUrls[key] = null;
      return null;
    }
    const blob = await response.blob();
    cachedBrandImageDataUrls[key] = await blobToDataUrl(blob);
    return cachedBrandImageDataUrls[key];
  } catch {
    cachedBrandImageDataUrls[key] = null;
    return null;
  }
}

async function loadTaulamicLogoDataUrl(): Promise<string | null> {
  return loadBrandImageDataUrl(TAULAMIC_LOGO_ICON_URL, 'logoIcon');
}

async function loadTaulamicWordmarkDataUrl(): Promise<string | null> {
  return loadBrandImageDataUrl(TAULAMIC_WORDMARK_URL, 'wordmark');
}

function toLines(doc: jsPDF, text: string, width: number): string[] {
  const split = doc.splitTextToSize(text, width);
  return Array.isArray(split) ? split : [split];
}

function truncate(text: string, max = 46): string {
  const compact = text.trim().replace(/\s+/g, ' ');
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, Math.max(1, max - 1))}…`;
}

function shortGuestName(text: string): string {
  const compact = text.trim().replace(/\s+/g, ' ');
  const words = compact.split(' ');
  const firstTwo = words.slice(0, 2).join(' ');
  return truncate(firstTwo, 16);
}

function tableShapeLabel(shape: string): string {
  const normalized = shape.trim().toLowerCase();
  if (normalized.includes('rect')) {
    return 'Rectangular';
  }
  if (normalized.includes('oval')) {
    return 'Ovalada';
  }
  if (normalized.includes('imperial')) {
    return 'Imperial';
  }
  return 'Redonda';
}

function writeKeyValue(
  doc: jsPDF,
  key: string,
  value: string,
  x: number,
  y: number,
  width: number,
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(74, 74, 74);
  doc.text(`${key}:`, x, y);

  doc.setFont('helvetica', 'normal');
  const keyWidth = Math.max(54, doc.getTextWidth(`${key}:`) + 8);
  const valueLines = toLines(doc, value, Math.max(80, width - keyWidth));
  doc.text(valueLines, x + keyWidth, y);
  return y + valueLines.length * 14;
}

function writeAlignedKeyValueRows(
  doc: jsPDF,
  rows: Array<[string, string]>,
  x: number,
  y: number,
  width: number,
): number {
  if (rows.length === 0) {
    return y;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const keyColumnWidth =
    Math.max(
      ...rows.map(([key]) => doc.getTextWidth(`${key}:`) + 8),
      92,
    );
  let cursorY = y;
  rows.forEach(([key, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`${key}:`, x, cursorY);

    doc.setFont('helvetica', 'normal');
    const lines = toLines(doc, value, Math.max(80, width - keyColumnWidth));
    doc.text(lines, x + keyColumnWidth, cursorY);
    cursorY += lines.length * 13;
  });
  return cursorY;
}

function drawTaulamicHeader(
  doc: jsPDF,
  context: PdfHeaderContext,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerHeight = 90;
  const margin = 36;
  const logoBoxWidth = 34;
  const logoBoxHeight = 34;
  let logoDrawWidth = 0;
  let hasLogo = false;

  doc.setFillColor(...COLOR_PRIMARY_SOFT);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(1.2);
  doc.line(0, headerHeight, pageWidth, headerHeight);

  if (context.logoDataUrl) {
    try {
      let logoWidth = 84;
      let logoHeight = 22;
      const maybeImageApi = doc as unknown as {
        getImageProperties?: (
          imageData: string,
        ) => { width: number; height: number };
      };
      if (maybeImageApi.getImageProperties) {
        const imageProps = maybeImageApi.getImageProperties(context.logoDataUrl);
        if (imageProps.width > 0 && imageProps.height > 0) {
          const ratio = imageProps.width / imageProps.height;
          logoWidth = Math.min(logoBoxWidth, logoBoxHeight * ratio);
          logoHeight = logoWidth / ratio;
          if (logoHeight > logoBoxHeight) {
            logoHeight = logoBoxHeight;
            logoWidth = logoHeight * ratio;
          }
        }
      }
      const logoY = 12 + (logoBoxHeight - logoHeight) / 2;
      doc.addImage(context.logoDataUrl, 'PNG', margin, logoY, logoWidth, logoHeight);
      logoDrawWidth = logoWidth;
      hasLogo = true;
    } catch {
      hasLogo = false;
    }
  }

  const brandX = hasLogo ? margin + logoDrawWidth + 8 : margin;
  const brandCenterY = 12 + logoBoxHeight / 2;
  let renderedWordmark = false;
  if (context.wordmarkDataUrl) {
    try {
      const maxWordmarkWidth = 150;
      const maxWordmarkHeight = 24;
      let wordmarkWidth = maxWordmarkWidth;
      let wordmarkHeight = maxWordmarkHeight;
      const maybeImageApi = doc as unknown as {
        getImageProperties?: (
          imageData: string,
        ) => { width: number; height: number };
      };
      if (maybeImageApi.getImageProperties) {
        const imageProps = maybeImageApi.getImageProperties(context.wordmarkDataUrl);
        if (imageProps.width > 0 && imageProps.height > 0) {
          const ratio = imageProps.width / imageProps.height;
          wordmarkWidth = Math.min(maxWordmarkWidth, maxWordmarkHeight * ratio);
          wordmarkHeight = wordmarkWidth / ratio;
          if (wordmarkHeight > maxWordmarkHeight) {
            wordmarkHeight = maxWordmarkHeight;
            wordmarkWidth = wordmarkHeight * ratio;
          }
        }
      }
      const wordmarkY = brandCenterY - wordmarkHeight / 2;
      doc.addImage(
        context.wordmarkDataUrl,
        'PNG',
        brandX,
        wordmarkY,
        wordmarkWidth,
        wordmarkHeight,
      );
      renderedWordmark = true;
    } catch {
      renderedWordmark = false;
    }
  }
  if (!renderedWordmark) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('Taulamic', brandX, 31);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(context.eventName || 'Evento sin nombre', margin, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(context.subtitle, margin, 71);

  return headerHeight + 22;
}

function drawStatCard(
  doc: jsPDF,
  rect: PdfRect,
  label: string,
  value: string,
  secondaryText?: string,
): void {
  doc.setDrawColor(...COLOR_BORDER);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rect.x, rect.y, rect.width, rect.height, 8, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(label.toUpperCase(), rect.x + 10, rect.y + 16);

  doc.setFontSize(16);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(value, rect.x + 10, rect.y + (secondaryText ? 32 : 36));

  if (!secondaryText) {
    return;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(secondaryText, rect.x + 10, rect.y + 45);
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(title, x, y);
}

function relationIconStyle(
  kind: RelationIconKind,
): {
  stroke: [number, number, number];
  isIncompatibility: boolean;
} {
  switch (kind) {
    case 'guest-affinity':
      return {
        stroke: [16, 185, 129],
        isIncompatibility: false,
      };
    case 'guest-incompatibility':
      return {
        stroke: [244, 63, 94],
        isIncompatibility: true,
      };
    case 'category-affinity':
      return {
        stroke: [65, 131, 215],
        isIncompatibility: false,
      };
    case 'category-incompatibility':
      return {
        stroke: [112, 82, 164],
        isIncompatibility: true,
      };
  }
}

function drawRelationIcon(
  doc: jsPDF,
  kind: RelationIconKind,
  x: number,
  y: number,
  size = 11,
): void {
  const icon = relationIconStyle(kind);
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;
  const linkRadius = Math.max(1.5, size * 0.17);
  const delta = size * 0.16;

  doc.setLineWidth(0.6);
  doc.setDrawColor(229, 229, 229);
  doc.setFillColor(255, 255, 255);
  doc.circle(centerX, centerY, outerRadius, 'FD');

  doc.setLineWidth(1.05);
  doc.setDrawColor(...icon.stroke);

  const leftX = centerX - delta;
  const rightX = centerX + delta;
  const upperY = centerY - delta * 0.25;
  const lowerY = centerY + delta * 0.25;

  doc.circle(leftX, upperY, linkRadius, 'S');
  doc.circle(rightX, lowerY, linkRadius, 'S');
  doc.line(leftX + linkRadius * 0.45, upperY + linkRadius * 0.35, rightX - linkRadius * 0.45, lowerY - linkRadius * 0.35);

  if (icon.isIncompatibility) {
    doc.setLineWidth(1.3);
    doc.line(centerX - outerRadius * 0.65, centerY + outerRadius * 0.65, centerX + outerRadius * 0.65, centerY - outerRadius * 0.65);
  }
}

function statusColor(status: MarkerStatus): [number, number, number] {
  switch (status) {
    case 'full':
      return [34, 160, 107];
    case 'in-use':
      return [229, 161, 0];
    case 'empty':
      return [138, 138, 138];
  }
}

function accessoryLabelById(accessoryId: string): string {
  return (
    FLOOR_PLAN_ACCESSORIES.find((accessory) => accessory.id === accessoryId)?.label ??
    accessoryId
  );
}

function rectsOverlap(a: PdfRect, b: PdfRect): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function drawAccessoryIconGlyph(
  doc: jsPDF,
  accessoryId: string,
  x: number,
  y: number,
  size = 10,
): void {
  const half = size / 2;
  const left = x - half;
  const top = y - half;
  doc.setLineWidth(0.8);
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setTextColor(...COLOR_PRIMARY);

  switch (accessoryId) {
    case 'mesa-presidencial':
    case 'mesa-novios':
      doc.roundedRect(left + 0.5, y - 1.4, size - 1, 2.8, 0.7, 0.7, 'S');
      doc.circle(left + size * 0.22, y - 2.6, 1, 'S');
      doc.circle(left + size * 0.5, y - 2.6, 1, 'S');
      doc.circle(left + size * 0.78, y - 2.6, 1, 'S');
      return;
    case 'pista-baile':
      doc.circle(x - 1.1, y + 1.6, 0.9, 'S');
      doc.line(x - 0.3, y + 1.2, x - 0.3, y - 2);
      doc.line(x - 0.3, y - 2, x + 1.8, y - 3);
      return;
    case 'barra-bar':
      doc.line(left + 1, top + 2, x, y + 1.4);
      doc.line(x, y + 1.4, left + size - 1, top + 2);
      doc.line(left + 1, top + 2, left + size - 1, top + 2);
      doc.line(x, y + 1.4, x, y + 4.2);
      doc.line(x - 1.6, y + 4.2, x + 1.6, y + 4.2);
      return;
    case 'puerta':
      doc.roundedRect(left + 1.8, top + 0.8, size - 3.6, size - 1.6, 0.8, 0.8, 'S');
      doc.line(x, top + 1.2, x, top + size - 1.2);
      doc.circle(x - 1.1, y, 0.35, 'F');
      doc.circle(x + 1.1, y, 0.35, 'F');
      return;
    case 'servicio':
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.4);
      doc.text('WC', x, y + 1.2, { align: 'center' });
      return;
    case 'escenario':
      doc.circle(left + size - 3.2, top + 3.2, 1.2, 'S');
      doc.line(left + size - 3.2, top + 4.4, left + size - 3.2, top + size - 2.6);
      doc.line(left + size - 3.2, top + size - 2.6, left + 3.2, top + size - 2);
      doc.circle(left + 2.6, top + size - 2, 0.85, 'S');
      return;
    case 'entrada':
      {
        const baseY = top + size - 1.2;
        const leftLegX = left + 1;
        const rightLegX = left + size - 1;
        const archCenterY = top + size * 0.45;
        const radiusX = (rightLegX - leftLegX) / 2;
        const radiusY = size * 0.4;
        doc.line(leftLegX, baseY, rightLegX, baseY);
        doc.line(leftLegX, baseY, leftLegX, archCenterY);
        doc.line(rightLegX, baseY, rightLegX, archCenterY);
        let prevX = leftLegX;
        let prevY = archCenterY;
        for (let index = 1; index <= 10; index += 1) {
          const t = index / 10;
          const angle = Math.PI * (1 - t);
          const nextX = x + radiusX * Math.cos(angle);
          const nextY = archCenterY - radiusY * Math.sin(angle);
          doc.line(prevX, prevY, nextX, nextY);
          prevX = nextX;
          prevY = nextY;
        }
      }
      return;
    default:
      doc.roundedRect(left + 1.5, top + 1.5, size - 3, size - 3, 0.8, 0.8, 'S');
  }
}

function placeAccessoryLabel(
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  roomRect: PdfRect,
  occupied: PdfRect[],
): { x: number; y: number; rect: PdfRect } {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const textWidth = doc.getTextWidth(label);
  const labelHeight = 8;
  const padX = 1.5;

  const rightRect: PdfRect = {
    x: x + 8,
    y: y - labelHeight / 2,
    width: textWidth + padX * 2,
    height: labelHeight,
  };
  const roomRight = roomRect.x + roomRect.width;
  const roomBottom = roomRect.y + roomRect.height;
  const rightFitsInside =
    rightRect.x >= roomRect.x &&
    rightRect.y >= roomRect.y &&
    rightRect.x + rightRect.width <= roomRight &&
    rightRect.y + rightRect.height <= roomBottom;
  if (rightFitsInside && !occupied.some((item) => rectsOverlap(item, rightRect))) {
    return {
      x: rightRect.x + padX,
      y: rightRect.y + labelHeight - 1.8,
      rect: rightRect,
    };
  }

  const leftRect: PdfRect = {
    x: x - 8 - (textWidth + padX * 2),
    y: y - labelHeight / 2,
    width: textWidth + padX * 2,
    height: labelHeight,
  };
  const leftFitsInside =
    leftRect.x >= roomRect.x &&
    leftRect.y >= roomRect.y &&
    leftRect.x + leftRect.width <= roomRight &&
    leftRect.y + leftRect.height <= roomBottom;
  if (leftFitsInside && !occupied.some((item) => rectsOverlap(item, leftRect))) {
    return {
      x: leftRect.x + padX,
      y: leftRect.y + labelHeight - 1.8,
      rect: leftRect,
    };
  }

  let belowY = y + 10;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const centeredX = Math.max(
      roomRect.x + 1,
      Math.min(roomRight - textWidth - 1, x - textWidth / 2),
    );
    const belowRect: PdfRect = {
      x: centeredX - padX,
      y: belowY - labelHeight + 1.2,
      width: textWidth + padX * 2,
      height: labelHeight,
    };
    const fitsInside =
      belowRect.x >= roomRect.x &&
      belowRect.y >= roomRect.y &&
      belowRect.x + belowRect.width <= roomRight &&
      belowRect.y + belowRect.height <= roomBottom;
    if (fitsInside && !occupied.some((item) => rectsOverlap(item, belowRect))) {
      return {
        x: centeredX,
        y: belowY,
        rect: belowRect,
      };
    }
    belowY += 8;
  }

  const fallbackX = Math.max(
    roomRect.x + 1,
    Math.min(roomRight - textWidth - 1, x - textWidth / 2),
  );
  const fallbackY = Math.min(roomBottom - 1.5, y + 7);
  const fallbackRect: PdfRect = {
    x: fallbackX - padX,
    y: fallbackY - labelHeight + 1.2,
    width: textWidth + padX * 2,
    height: labelHeight,
  };
  return {
    x: fallbackX,
    y: fallbackY,
    rect: fallbackRect,
  };
}

function drawTableMarkerOnPlan(
  doc: jsPDF,
  group: DistributionTableGroup,
  x: number,
  y: number,
): void {
  const [r, g, b] = statusColor(group.status);
  const normalized = group.tableShape.trim().toLowerCase();
  const markerW = 30;
  const markerH = 22;

  doc.setLineWidth(0.8);
  doc.setFillColor(r, g, b);
  doc.setDrawColor(255, 255, 255);

  if (normalized.includes('rect') || normalized.includes('imperial')) {
    doc.roundedRect(x - markerW / 2, y - markerH / 2, markerW, markerH, 4, 4, 'FD');
  } else if (normalized.includes('oval')) {
    doc.ellipse(x, y, markerW / 2, markerH / 2, 'FD');
  } else {
    doc.circle(x, y, 12, 'FD');
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(group.tableLabel, x, y + 2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(`${group.assignedCount}/${group.capacity}`, x, y + 16, {
    align: 'center',
  });
}

function parseViewBox(viewBox: string): {
  minX: number;
  minY: number;
  width: number;
  height: number;
} {
  const parts = viewBox.split(/\s+/).map(Number);
  return {
    minX: parts[0] ?? -72,
    minY: parts[1] ?? -52,
    width: parts[2] ?? 388,
    height: parts[3] ?? 340,
  };
}

function seatLabelOfPlacement(placement: ProposalPlacement): string | undefined {
  if (placement.seatLabel?.trim()) {
    return placement.seatLabel.trim();
  }
  if (placement.seatIndex !== undefined) {
    return `S${placement.seatIndex + 1}`;
  }
  return undefined;
}

function buildSeatMap(
  placements: ProposalPlacement[],
): {
  seatMap: SeatMap;
  sorted: ProposalPlacement[];
  effectiveCapacity: number;
} {
  const sorted = [...placements].sort((left, right) => {
    const leftSeat = left.seatIndex ?? Number.MAX_SAFE_INTEGER;
    const rightSeat = right.seatIndex ?? Number.MAX_SAFE_INTEGER;
    if (leftSeat !== rightSeat) {
      return leftSeat - rightSeat;
    }
    return left.guestName.localeCompare(right.guestName, 'es', {
      sensitivity: 'base',
    });
  });

  const seatMap: SeatMap = {};
  let maxSeat = 0;
  sorted.forEach((placement) => {
    const seatLabel = seatLabelOfPlacement(placement);
    if (!seatLabel) {
      return;
    }
    const seatNumber = Number.parseInt(seatLabel.slice(1), 10);
    if (Number.isFinite(seatNumber)) {
      maxSeat = Math.max(maxSeat, seatNumber);
    }
    seatMap[seatLabel] = placement;
  });

  const effectiveCapacity = Math.max(maxSeat, sorted.length);
  return { seatMap, sorted, effectiveCapacity };
}

function drawTableBodyInDiagram(
  doc: jsPDF,
  shape: string,
  mapPoint: (x: number, y: number) => { x: number; y: number },
  scaleX: number,
  scaleY: number,
  tableLabel: string,
): void {
  const normalized = shape.trim().toLowerCase();
  const cx = TABLE_DIAGRAM.cx;
  const cy = TABLE_DIAGRAM.cy;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(1);

  if (normalized.includes('rect') || normalized.includes('imperial')) {
    const left = cx - 78;
    const top = cy - 54;
    const topLeft = mapPoint(left, top);
    const width = 156 * scaleX;
    const height = 108 * scaleY;
    doc.roundedRect(topLeft.x, topLeft.y, width, height, 6, 6, 'FD');
  } else if (normalized.includes('oval')) {
    const center = mapPoint(cx, cy);
    doc.ellipse(center.x, center.y, 86 * scaleX, 50 * scaleY, 'FD');
  } else {
    const center = mapPoint(cx, cy);
    doc.circle(center.x, center.y, 58 * Math.min(scaleX, scaleY), 'FD');
  }

  const textCenter = mapPoint(cx, cy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(tableLabel, textCenter.x, textCenter.y + 3, { align: 'center' });
}

function drawTableMiniDiagram(
  doc: jsPDF,
  group: DistributionTableGroup,
  placements: ProposalPlacement[],
  rect: PdfRect,
  relationItems: TableRelationItem[] = [],
  guestPrimaryCategoryById?: Map<string, string>,
): void {
  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }
  const { seatMap, effectiveCapacity } = buildSeatMap(placements);
  const capacity = Math.max(group.capacity, effectiveCapacity, group.assignedCount, 1);
  const positions = getDiagramSeatPositions(group.tableShape, capacity);
  const seatPositionByLabel = new Map(positions.map((seat) => [seat.label, seat]));
  const seatLabelByGuestId = new Map<string, string>();
  placements.forEach((placement) => {
    const seatLabel = seatLabelOfPlacement(placement);
    if (!seatLabel) {
      return;
    }
    seatLabelByGuestId.set(placement.guestId, seatLabel);
  });
  const view = parseViewBox(TABLE_DIAGRAM.viewBox);
  const baseScale = Math.min(rect.width / view.width, rect.height / view.height);
  const uniformScale = baseScale * 1.1;
  const scaleX = uniformScale;
  const scaleY = uniformScale;
  const offsetX = rect.x + (rect.width - view.width * uniformScale) / 2;
  const offsetY = rect.y + (rect.height - view.height * uniformScale) / 2;
  const seatRadius = Math.max(
    4.8,
    TABLE_DIAGRAM.seatRadius * Math.min(scaleX, scaleY) * 0.9,
  );

  const mapPoint = (x: number, y: number): { x: number; y: number } => ({
    x: offsetX + (x - view.minX) * scaleX,
    y: offsetY + (y - view.minY) * scaleY,
  });

  drawTableBodyInDiagram(
    doc,
    group.tableShape,
    mapPoint,
    scaleX,
    scaleY,
    group.tableLabel,
  );

  const relationMarkers = relationItems.filter(
    (relation) =>
      (relation.kind === 'guest-affinity' ||
        relation.kind === 'guest-incompatibility') &&
      Boolean(relation.guestAId) &&
      Boolean(relation.guestBId),
  );
  const renderedMarkers = new Set<string>();
  relationMarkers.forEach((relation) => {
    const guestAId = relation.guestAId ?? '';
    const guestBId = relation.guestBId ?? '';
    const seatLabelA = seatLabelByGuestId.get(guestAId);
    const seatLabelB = seatLabelByGuestId.get(guestBId);
    if (!seatLabelA || !seatLabelB || seatLabelA === seatLabelB) {
      return;
    }
    const seatA = seatPositionByLabel.get(seatLabelA);
    const seatB = seatPositionByLabel.get(seatLabelB);
    if (!seatA || !seatB) {
      return;
    }
    const dedupeKey = `${relation.kind}:${[seatLabelA, seatLabelB].sort().join('|')}`;
    if (renderedMarkers.has(dedupeKey)) {
      return;
    }
    renderedMarkers.add(dedupeKey);
    const midpoint = mapPoint(
      (seatA.seatX + seatB.seatX) / 2,
      (seatA.seatY + seatB.seatY) / 2,
    );
    drawRelationIcon(doc, relation.kind, midpoint.x - 4, midpoint.y - 4, 8);
  });

  positions.forEach((seat) => {
    const center = mapPoint(seat.seatX, seat.seatY);
    const occupant = seatMap[seat.label];
    const occupantCategory = occupant
      ? guestPrimaryCategoryById?.get(occupant.guestId)
      : undefined;
    if (occupant) {
      const color = categoryPaletteToRgb(occupantCategory);
      doc.setFillColor(...color.fill);
      doc.setDrawColor(...color.border);
    } else {
      const emptyColor = categoryPaletteToRgb(undefined, { empty: true });
      doc.setFillColor(...emptyColor.fill);
      doc.setDrawColor(...emptyColor.border);
    }
    doc.circle(center.x, center.y, seatRadius, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.6);
    const seatLabelColor: [number, number, number] = occupant
      ? categoryPaletteToRgb(occupantCategory).text
      : categoryPaletteToRgb(undefined, { empty: true }).text;
    doc.setTextColor(...seatLabelColor);
    doc.text(seat.label, center.x, center.y + 1.85, { align: 'center' });

    if (!occupant) {
      return;
    }

    const namePoint = mapPoint(seat.nameX, seat.nameY);
    const name = shortGuestName(occupant.guestName);
    const align =
      seat.textAnchor === 'middle'
        ? 'center'
        : seat.textAnchor === 'end'
          ? 'right'
          : 'left';
    const minX = offsetX + 6;
    const maxX = offsetX + view.width * uniformScale - 6;
    const clampedX = Math.max(minX, Math.min(maxX, namePoint.x));
    const minY = offsetY + 8;
    const maxY = offsetY + view.height * uniformScale - 5;
    const clampedY = Math.max(minY, Math.min(maxY, namePoint.y));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(name, clampedX, clampedY, { align });
  });
}

function drawSummaryListCard(
  doc: jsPDF,
  title: string,
  rows: string[],
  x: number,
  y: number,
  width: number,
): number {
  drawSectionTitle(doc, title, x, y);
  const cardTop = y + 10;
  const availableWidth = width - 20;
  const flattened: string[] = [];
  rows.forEach((row) => {
    const lines = toLines(doc, row, availableWidth);
    flattened.push(...lines);
  });
  if (flattened.length === 0) {
    flattened.push('—');
  }

  const cardHeight = Math.min(110, 20 + flattened.length * 10);
  doc.setDrawColor(...COLOR_BORDER);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, cardTop, width, cardHeight, 8, 8, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(...COLOR_MUTED);
  const maxLines = Math.max(1, Math.floor((cardHeight - 14) / 10));
  flattened.slice(0, maxLines).forEach((line, index) => {
    doc.text(line, x + 10, cardTop + 14 + index * 10);
  });

  return cardTop + cardHeight + 12;
}

function drawCategorySummaryFlow(
  doc: jsPDF,
  categories: CategoryDispersionItem[],
  options: {
    x: number;
    y: number;
    width: number;
    margin: number;
    headerContext: PdfHeaderContext;
  },
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 10;
  const bottomPadding = 8;
  const safeBottom = pageHeight - options.margin;
  let cursorY = options.y;
  const printHeader = (title: string): void => {
    drawSectionTitle(doc, title, options.x, cursorY);
    cursorY += 18;
  };

  printHeader('Categorías de invitados');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);

  if (categories.length === 0) {
    doc.setTextColor(...COLOR_EMPTY_SEAT_TEXT);
    doc.text('Sin categorías registradas.', options.x + 2, cursorY);
    return cursorY + 12;
  }

  categories.forEach((category) => {
    const lineText = `${category.name}: ${category.guestCount} invitado(s) · ${category.tableCount} mesa(s)`;
    const lines = toLines(doc, lineText, Math.max(60, options.width - 12));
    lines.forEach((line, lineIndex) => {
      if (cursorY + lineHeight > safeBottom) {
        doc.addPage();
        cursorY = drawTaulamicHeader(
          doc,
          options.headerContext,
        );
        drawSectionTitle(doc, 'Categorías de invitados', options.x, cursorY);
        cursorY += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
      }
      const color = categoryPaletteToRgb(category.name);
      if (lineIndex === 0) {
        doc.setFillColor(...color.fill);
        doc.setDrawColor(...color.border);
        doc.rect(options.x + 2, cursorY - 5.2, 4.2, 4.2, 'FD');
      }
      doc.setTextColor(...color.border);
      doc.text(line, options.x + 10, cursorY);
      cursorY += lineHeight;
    });
  });

  return cursorY + bottomPadding;
}

function buildGlobalRelationSummary(
  input: DownloadDistributionReportPdfInput,
  guestNameById: Map<string, string>,
): {
  categoryRows: RelationSummaryRow[];
  guestRows: RelationSummaryRow[];
} {
  const categoryRows = (() => {
    const dedupe = new Set<string>();
    const rows: RelationSummaryRow[] = [];
    (input.eventMeta.categoryAffinityRelations ?? []).forEach((relation) => {
      const pair = [relation.categoryA.trim(), relation.categoryB.trim()].sort();
      const key = `${relation.type}:${pair[0].toLowerCase()}|${pair[1].toLowerCase()}`;
      if (dedupe.has(key)) {
        return;
      }
      dedupe.add(key);
      const prefix = relation.type === 'afinidad' ? 'Afinidad' : 'Incompatibilidad';
      rows.push({
        text: `${prefix}: ${pair[0]} · ${pair[1]}`,
        kind:
          relation.type === 'afinidad'
            ? 'category-affinity'
            : 'category-incompatibility',
      });
    });
    return rows.sort((left, right) =>
      left.text.localeCompare(right.text, 'es', { sensitivity: 'base' }),
    );
  })();

  const guestRows = (() => {
    const dedupe = new Set<string>();
    const rows: RelationSummaryRow[] = [];
    (input.eventMeta.affinityRelations ?? []).forEach((relation) => {
      const guestA = resolveGuestRelationLabel(relation.guestA, guestNameById);
      const guestB = resolveGuestRelationLabel(relation.guestB, guestNameById);
      const pair = [guestA.trim(), guestB.trim()].sort();
      const key = `${relation.type}:${normalizeRelationKey(
        relation.guestA,
        relation.guestB,
      )}`;
      if (dedupe.has(key)) {
        return;
      }
      dedupe.add(key);
      const prefix = relation.type === 'afinidad' ? 'Afinidad' : 'Incompatibilidad';
      rows.push({
        text: `${prefix}: ${pair[0]} · ${pair[1]}`,
        kind:
          relation.type === 'afinidad'
            ? 'guest-affinity'
            : 'guest-incompatibility',
      });
    });
    return rows.sort((left, right) =>
      left.text.localeCompare(right.text, 'es', { sensitivity: 'base' }),
    );
  })();

  return { categoryRows, guestRows };
}

function drawRelationsBlock(
  doc: jsPDF,
  input: DownloadDistributionReportPdfInput,
  x: number,
  y: number,
  width: number,
  guestNameById: Map<string, string>,
  headerContext: PdfHeaderContext,
  margin: number,
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  let cursorY = y;
  const ensureSpace = (requiredHeight: number): void => {
    if (cursorY + requiredHeight <= pageHeight - margin) {
      return;
    }
    doc.addPage();
    cursorY = drawTaulamicHeader(doc, headerContext);
  };

  ensureSpace(106);
  drawSectionTitle(doc, 'Relaciones', x, cursorY);
  cursorY += 16;
  cursorY = drawRelationLegend(doc, x, cursorY, width);

  const summary = buildGlobalRelationSummary(input, guestNameById);
  const drawRelationRows = (
    title: string,
    rows: RelationSummaryRow[],
    emptyText: string,
  ): void => {
    ensureSpace(44);
    drawSectionTitle(doc, title, x, cursorY);
    cursorY += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.9);
    if (rows.length === 0) {
      doc.setTextColor(...COLOR_EMPTY_SEAT_TEXT);
      doc.text(emptyText, x + 2, cursorY);
      cursorY += 14;
      return;
    }
    rows.forEach((row) => {
      const lines = toLines(doc, row.text, width - 24);
      const neededHeight = Math.max(14, lines.length * 10.8 + 4);
      ensureSpace(neededHeight + 3);
      drawRelationIcon(doc, row.kind, x + 2, cursorY - 8.5, 9.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(lines, x + 16, cursorY);
      cursorY += neededHeight + 1;
    });
    cursorY += 4;
  };

  drawRelationRows(
    'Relaciones por categorías',
    summary.categoryRows,
    'No hay relaciones de categorías.',
  );
  drawRelationRows(
    'Relaciones por invitados',
    summary.guestRows,
    'No hay relaciones de invitados.',
  );

  return cursorY + 4;
}

function drawRelationLegend(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
): number {
  const cardTop = y + 2;
  const cardHeight = 36;
  doc.setDrawColor(...COLOR_BORDER);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, cardTop, width, cardHeight, 8, 8, 'FD');

  const entries: Array<{ kind: RelationIconKind; label: string }> = [
    { kind: 'guest-affinity', label: 'Afinidad invitados' },
    { kind: 'guest-incompatibility', label: 'Incompatibilidad invitados' },
    { kind: 'category-affinity', label: 'Afinidad categorías' },
    { kind: 'category-incompatibility', label: 'Incompatibilidad categorías' },
  ];

  const startX = x + 10;
  const gap = Math.max(84, (width - 20) / entries.length);
  entries.forEach((entry, index) => {
    const itemX = startX + index * gap;
    drawRelationIcon(doc, entry.kind, itemX, cardTop + 11, 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(entry.label, itemX + 15, cardTop + 20);
  });

  return cardTop + cardHeight + 16;
}

function drawFloorPlanPage(
  doc: jsPDF,
  input: DownloadDistributionReportPdfInput,
  headerContext: PdfHeaderContext,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const sortedGroups = [...input.tableGroups].sort((left, right) =>
    compareTableLabels(left.tableLabel, right.tableLabel),
  );

  doc.addPage();
  const contentTop = drawTaulamicHeader(doc, headerContext);
  let sectionTop = contentTop;
  drawSectionTitle(doc, 'Plano del salón', margin, sectionTop);
  sectionTop += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(formatRoomDimensions(input.roomSetup), margin, sectionTop);
  sectionTop += 10;

  const planMaxWidth = pageWidth - margin * 2;
  const planMaxHeight = pageHeight - sectionTop - margin - 22;
  const canvasRef = roomPixelSize(input.roomSetup, 420);
  const roomAspect = canvasRef.widthPx / Math.max(1, canvasRef.heightPx);

  let roomDrawWidth = planMaxWidth;
  let roomDrawHeight = roomDrawWidth / Math.max(roomAspect, 0.1);
  if (roomDrawHeight > planMaxHeight) {
    roomDrawHeight = planMaxHeight;
    roomDrawWidth = roomDrawHeight * roomAspect;
  }

  const roomX = margin + (planMaxWidth - roomDrawWidth) / 2;
  const roomY = sectionTop + (planMaxHeight - roomDrawHeight) / 2;
  const roomCenterX = roomX + roomDrawWidth / 2;
  const roomCenterY = roomY + roomDrawHeight / 2;

  doc.setDrawColor(...COLOR_BORDER);
  doc.setFillColor(...COLOR_CANVAS);
  doc.setLineWidth(1);
  switch (input.roomSetup.shape) {
    case 'round': {
      const radius = Math.min(roomDrawWidth, roomDrawHeight) / 2;
      doc.circle(roomCenterX, roomCenterY, radius, 'FD');
      break;
    }
    case 'oval':
      doc.ellipse(
        roomCenterX,
        roomCenterY,
        roomDrawWidth / 2,
        roomDrawHeight / 2,
        'FD',
      );
      break;
    default:
      doc.roundedRect(roomX, roomY, roomDrawWidth, roomDrawHeight, 16, 16, 'FD');
      break;
  }

  const tableCount = sortedGroups.length;
  const layoutRefPx = Math.max(canvasRef.widthPx, canvasRef.heightPx);
  const insets = computeTableLayoutInsets(tableCount, layoutRefPx);
  const zoneWidthPx = ((100 - insets.insetX * 2) / 100) * canvasRef.widthPx;
  const zoneHeightPx = ((100 - insets.insetY * 2) / 100) * canvasRef.heightPx;
  const gridLayout = computeTableGridLayout(tableCount, zoneWidthPx, zoneHeightPx);
  const zoneWidthPercent = 100 - insets.insetX * 2;
  const zoneHeightPercent = 100 - insets.insetY * 2;

  const defaultTablePosition = (tableIndex: number): LayoutPosition => {
    const { columns, scale, compact } = gridLayout;
    const slotWidth = compact ? 40 : 48;
    const slotHeight = compact ? 36 : 44;
    const gridLeftPx =
      canvasRef.widthPx * (insets.insetX / 100) +
      ((canvasRef.widthPx * (zoneWidthPercent / 100)) - gridLayout.scaledWidth) / 2;
    const gridTopPx =
      canvasRef.heightPx * (insets.insetY / 100) +
      ((canvasRef.heightPx * (zoneHeightPercent / 100)) -
        gridLayout.scaledHeight) /
        2;

    const col = tableIndex % columns;
    const row = Math.floor(tableIndex / columns);
    const slotLeftPx = col * (slotWidth + 2) * scale;
    const slotTopPx = row * (slotHeight + 2) * scale;
    const centerXPx = gridLeftPx + slotLeftPx + (slotWidth * scale) / 2;
    const centerYPx = gridTopPx + slotTopPx + (slotHeight * scale) / 2;
    return {
      x: (centerXPx / canvasRef.widthPx) * 100,
      y: (centerYPx / canvasRef.heightPx) * 100,
    };
  };

  const toRoomX = (percent: number): number => roomX + (percent / 100) * roomDrawWidth;
  const toRoomY = (percent: number): number => roomY + (percent / 100) * roomDrawHeight;
  const roomRect: PdfRect = {
    x: roomX + 2,
    y: roomY + 2,
    width: Math.max(12, roomDrawWidth - 4),
    height: Math.max(12, roomDrawHeight - 4),
  };
  const accessoryLabelRects: PdfRect[] = [];

  const accessoryLayouts = resolveAccessoryLayouts(
    input.roomSetup.placedAccessories,
    tableCount,
    layoutRefPx,
    {
      labeled: true,
      roomShape: input.roomSetup.shape,
    },
  );

  for (const accessoryId of input.roomSetup.placedAccessories) {
    const custom = input.customLayoutPositions[accessoryId];
    const fallback = accessoryLayouts[accessoryId] ?? { left: '50%', top: '50%' };
    const xPercent = custom?.x ?? Number.parseFloat(fallback.left);
    const yPercent = custom?.y ?? Number.parseFloat(fallback.top);
    const x = toRoomX(xPercent);
    const y = toRoomY(yPercent);
    const iconHalf = 6;
    const clampedX = Math.max(
      roomRect.x + iconHalf,
      Math.min(roomRect.x + roomRect.width - iconHalf, x),
    );
    const clampedY = Math.max(
      roomRect.y + iconHalf,
      Math.min(roomRect.y + roomRect.height - iconHalf, y),
    );

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLOR_PRIMARY);
    doc.roundedRect(clampedX - iconHalf, clampedY - iconHalf, iconHalf * 2, iconHalf * 2, 2, 2, 'FD');
    drawAccessoryIconGlyph(doc, accessoryId, clampedX, clampedY, 8.8);

    const accessoryLabel = accessoryLabelById(accessoryId);
    const labelPlacement = placeAccessoryLabel(
      doc,
      accessoryLabel,
      clampedX,
      clampedY,
      roomRect,
      accessoryLabelRects,
    );
    accessoryLabelRects.push(labelPlacement.rect);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(accessoryLabel, labelPlacement.x, labelPlacement.y);
  }

  for (const [index, group] of sortedGroups.entries()) {
    const custom = input.customLayoutPositions[group.tableId];
    const position = custom ?? defaultTablePosition(index);
    const x = toRoomX(position.x);
    const y = toRoomY(position.y);
    drawTableMarkerOnPlan(doc, group, x, y);
  }

  const legendY = Math.min(pageHeight - margin + 6, roomY + roomDrawHeight + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Leyenda:', margin, legendY);
  const legendItems: Array<{ label: string; status: MarkerStatus }> = [
    { label: 'Llena', status: 'full' },
    { label: 'En uso', status: 'in-use' },
    { label: 'Vacía', status: 'empty' },
  ];
  let legendX = margin + 42;
  legendItems.forEach((item) => {
    const [r, g, b] = statusColor(item.status);
    doc.setFillColor(r, g, b);
    doc.circle(legendX, legendY - 3, 4, 'F');
    doc.setTextColor(...COLOR_MUTED);
    doc.text(item.label, legendX + 7, legendY);
    legendX += 62;
  });
}

function drawTableDetailsPages(
  doc: jsPDF,
  input: DownloadDistributionReportPdfInput,
  headerContext: PdfHeaderContext,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  const sortedGroups = [...input.tableGroups].sort((left, right) =>
    compareTableLabels(left.tableLabel, right.tableLabel),
  );
  const placementsByTableId = new Map<
    string,
    Array<DistributionProposal['placements'][number]>
  >();
  input.proposal.placements.forEach((placement) => {
    const list = placementsByTableId.get(placement.tableId) ?? [];
    list.push(placement);
    placementsByTableId.set(placement.tableId, list);
  });
  placementsByTableId.forEach((placements) => {
    placements.sort((left, right) => {
      const leftSeat = left.seatIndex ?? Number.MAX_SAFE_INTEGER;
      const rightSeat = right.seatIndex ?? Number.MAX_SAFE_INTEGER;
      if (leftSeat !== rightSeat) {
        return leftSeat - rightSeat;
      }
      return left.guestName.localeCompare(right.guestName, 'es', {
        sensitivity: 'base',
      });
    });
  });
  const guestNameById = buildGuestNameById(input);
  const guestRelations = input.eventMeta.affinityRelations ?? [];
  const categoryRelations = input.eventMeta.categoryAffinityRelations ?? [];
  const guestPrimaryCategoryById = buildGuestPrimaryCategoryById(input);

  const activeGroups = sortedGroups.filter((group) => group.assignedCount > 0);
  const emptyGroups = sortedGroups.filter((group) => group.assignedCount <= 0);
  const drawEmptyTablesSummary = (startY: number): number => {
    let summaryTop = startY;
    drawSectionTitle(doc, 'Mesas sin ocupación', margin, summaryTop);
    summaryTop += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_MUTED);
    const emptyLines = toLines(
      doc,
      emptyGroups.map((group) => group.tableLabel).join(', '),
      contentWidth,
    );
    doc.text(emptyLines, margin, summaryTop);
    return summaryTop + emptyLines.length * 10 + 8;
  };

  if (activeGroups.length === 0) {
    if (emptyGroups.length > 0) {
      doc.addPage();
      const contentTop = drawTaulamicHeader(doc, headerContext);
      drawEmptyTablesSummary(contentTop);
    }
    return;
  }

  const blocksPerPage = 2;
  const blockGap = 8;
  const minBlockHeight = 196;
  let groupIndex = 0;
  let renderEmptySummaryInNextPage = emptyGroups.length > 0;

  while (groupIndex < activeGroups.length) {
    doc.addPage();
    let pageTop = drawTaulamicHeader(doc, headerContext);
    if (renderEmptySummaryInNextPage) {
      pageTop = drawEmptyTablesSummary(pageTop);
      renderEmptySummaryInNextPage = false;
    }
    drawSectionTitle(doc, 'Detalle de mesas', margin, pageTop);
    pageTop += 6;
    const availableHeight = pageHeight - margin - pageTop;
    const remainingTables = activeGroups.length - groupIndex;
    const maxBlocksByHeight = Math.max(
      1,
      Math.min(
        blocksPerPage,
        Math.floor((availableHeight + blockGap) / (minBlockHeight + blockGap)),
      ),
    );
    const blocksThisPage = Math.max(
      1,
      Math.min(remainingTables, maxBlocksByHeight),
    );
    const blockHeight = Math.max(
      minBlockHeight,
      Math.min(
        312,
        (availableHeight - blockGap * (blocksThisPage - 1)) / blocksThisPage,
      ),
    );

    for (
      let slot = 0;
      slot < blocksThisPage && groupIndex < activeGroups.length;
      slot += 1, groupIndex += 1
    ) {
      const group = activeGroups[groupIndex];
      const blockY = pageTop + slot * (blockHeight + blockGap);
      const blockRect: PdfRect = {
        x: margin,
        y: blockY,
        width: contentWidth,
        height: blockHeight,
      };

      const placements = placementsByTableId.get(group.tableId) ?? [];
      const tableGuestIds = new Set(placements.map((placement) => placement.guestId));
      const tableGuestIdByNormalizedName = new Map<string, string>();
      placements.forEach((placement) => {
        const normalizedName = placement.guestName.trim().toLowerCase();
        if (!normalizedName || tableGuestIdByNormalizedName.has(normalizedName)) {
          return;
        }
        tableGuestIdByNormalizedName.set(normalizedName, placement.guestId);
      });
      const tableCategoryCounts = buildTableCategoryCounts(group);
      const tableCategorySet = new Set(
        tableCategoryCounts.map((category) => category.name),
      );
      const relationItems = buildTableRelationItems(
        guestRelations,
        categoryRelations,
        tableGuestIds,
        tableCategorySet,
        guestNameById,
        tableGuestIdByNormalizedName,
      );
      const categoryRelationItems = relationItems.filter(
        (item) =>
          item.kind === 'category-affinity' ||
          item.kind === 'category-incompatibility',
      );
      const guestRelationItems = relationItems.filter(
        (item) =>
          item.kind === 'guest-affinity' || item.kind === 'guest-incompatibility',
      );

      const affinityLabel =
        group.tableAffinity && group.tableAffinity.maxPoints > 0
          ? `${formatPercent(group.tableAffinity.percent)}%`
          : 'N/D';
      const occupancyStatus =
        group.assignedCount > group.capacity
          ? 'Sobrecapacidad elástica'
          : group.assignedCount >= group.capacity
            ? 'Completa'
            : 'Parcial';
      const mainCategory =
        tableCategoryCounts[0]?.name ??
        (group.categoryNames[0]?.trim() ? group.categoryNames[0] : 'Mesa mixta');

      doc.setDrawColor(...COLOR_BORDER);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        blockRect.x,
        blockRect.y,
        blockRect.width,
        blockRect.height,
        8,
        8,
        'FD',
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(...COLOR_TEXT);
      doc.text(group.tableLabel, blockRect.x + 12, blockRect.y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.4);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(
        `Ocupación: ${group.assignedCount}/${group.capacity} · ${occupancyStatus} · Afinidad: ${affinityLabel} · Formato: ${tableShapeLabel(group.tableShape)}`,
        blockRect.x + 12,
        blockRect.y + 31,
      );

      const contentTop = blockRect.y + 38;
      const contentBottom = blockRect.y + blockRect.height - 10;
      const innerGap = 10;
      const leftWidth = Math.max(210, blockRect.width * 0.57);
      const leftRect: PdfRect = {
        x: blockRect.x + 10,
        y: contentTop,
        width: leftWidth,
        height: Math.max(20, contentBottom - contentTop),
      };
      const rightRect: PdfRect = {
        x: leftRect.x + leftRect.width + innerGap,
        y: contentTop,
        width: Math.max(
          140,
          blockRect.x + blockRect.width - (leftRect.x + leftRect.width + innerGap) - 10,
        ),
        height: Math.max(20, contentBottom - contentTop),
      };

      let leftCursorY = leftRect.y + 10;
      const leftBottom = leftRect.y + leftRect.height - 8;
      const writeInfoLine = (label: string, value: string): void => {
        if (leftCursorY > leftBottom) {
          return;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.3);
        doc.setTextColor(...COLOR_MUTED);
        doc.text(`${label}:`, leftRect.x + 2, leftCursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLOR_TEXT);
        const lines = toLines(doc, value, Math.max(80, leftRect.width - 94));
        doc.text(lines, leftRect.x + 88, leftCursorY);
        leftCursorY += Math.max(9, lines.length * 8.6);
      };

      writeInfoLine('Categoría principal', mainCategory);
      writeInfoLine('Invitados en mesa', String(group.assignedCount));
      leftCursorY += 2;

      const writeSubsection = (title: string): void => {
        if (leftCursorY > leftBottom) {
          return;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.7);
        doc.setTextColor(...COLOR_TEXT);
        doc.text(title, leftRect.x + 2, leftCursorY);
        leftCursorY += 9;
      };

      writeSubsection('Categorías');
      if (tableCategoryCounts.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(...COLOR_EMPTY_SEAT_TEXT);
        doc.text('Sin categorías registradas.', leftRect.x + 2, leftCursorY);
        leftCursorY += 8.6;
      } else {
        tableCategoryCounts.forEach((category) => {
          if (leftCursorY > leftBottom) {
            return;
          }
          const color = categoryPaletteToRgb(category.name);
          doc.setFillColor(...color.fill);
          doc.setDrawColor(...color.border);
          doc.rect(leftRect.x + 2, leftCursorY - 4.8, 3.8, 3.8, 'FD');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.2);
          doc.setTextColor(...color.border);
          const lines = toLines(
            doc,
            `${category.name}: ${category.count}`,
            leftRect.width - 14,
          );
          doc.text(lines, leftRect.x + 9, leftCursorY);
          leftCursorY += lines.length * 8.4 + 0.6;
        });
      }
      leftCursorY += 2;

      const writeRelations = (
        title: string,
        items: TableRelationItem[],
        emptyText: string,
      ): void => {
        writeSubsection(title);
        if (leftCursorY > leftBottom) {
          return;
        }
        if (items.length === 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.2);
          doc.setTextColor(...COLOR_EMPTY_SEAT_TEXT);
          doc.text(emptyText, leftRect.x + 2, leftCursorY);
          leftCursorY += 8.6;
          return;
        }
        items.forEach((relation) => {
          if (leftCursorY > leftBottom) {
            return;
          }
          drawRelationIcon(doc, relation.kind, leftRect.x + 2, leftCursorY - 7, 8.8);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.1);
          doc.setTextColor(...COLOR_MUTED);
          const lines = toLines(doc, relation.label, leftRect.width - 18);
          doc.text(lines, leftRect.x + 13, leftCursorY);
          leftCursorY += lines.length * 8.2 + 0.6;
        });
      };

      writeRelations(
        'Relaciones categorías',
        categoryRelationItems,
        'No hay relaciones de categorías.',
      );
      writeRelations(
        'Relaciones invitados',
        guestRelationItems,
        'No hay relaciones de invitados.',
      );

      writeSubsection('Sillas');
      if (placements.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(...COLOR_EMPTY_SEAT_TEXT);
        doc.text('Sin invitados asignados.', leftRect.x + 2, leftCursorY);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.1);
        doc.setTextColor(...COLOR_MUTED);
        placements.forEach((placement) => {
          if (leftCursorY > leftBottom) {
            return;
          }
          const seatLabel =
            placement.seatLabel ??
            (placement.seatIndex !== undefined
              ? `Silla ${placement.seatIndex + 1}`
              : 'Silla');
          const lines = toLines(
            doc,
            `${seatLabel}: ${truncate(placement.guestName, 34)}`,
            leftRect.width - 8,
          );
          doc.text(lines, leftRect.x + 2, leftCursorY);
          leftCursorY += lines.length * 8.2 + 0.6;
        });
      }

      const diagramRect: PdfRect = {
        x: rightRect.x,
        y: rightRect.y,
        width: rightRect.width,
        height: Math.max(80, rightRect.height - 4),
      };
      drawTableMiniDiagram(
        doc,
        group,
        placements,
        {
          x: diagramRect.x + 1,
          y: diagramRect.y - 12,
          width: diagramRect.width - 2,
          height: diagramRect.height + 8,
        },
        relationItems,
        guestPrimaryCategoryById,
      );
    }
  }
}

function drawPageNumbers(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`${page}`, pageWidth - 36, pageHeight - 18, {
      align: 'right',
    });
  }
}

function buildFileName(eventName: string): string {
  const safe = eventName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  const stamp = new Date().toISOString().slice(0, 10);
  return `informe-distribucion-${safe || 'evento'}-${stamp}.pdf`;
}

export async function downloadDistributionReportPdf(
  input: DownloadDistributionReportPdfInput,
): Promise<void> {
  const { jsPDF: JsPdf } = await import('jspdf');
  const doc = new JsPdf({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  const confirmedLabel = formatDateTime(input.proposal.confirmedAt);
  const [logoDataUrl, wordmarkDataUrl] = await Promise.all([
    loadTaulamicLogoDataUrl(),
    loadTaulamicWordmarkDataUrl(),
  ]);
  const headerContext: PdfHeaderContext = {
    eventName: input.eventName?.trim() || 'Evento sin nombre',
    subtitle:
      confirmedLabel === '—'
        ? 'Informe de distribución confirmado · Sin fecha de confirmación'
        : `Informe de distribución confirmado · ${confirmedLabel}`,
    logoDataUrl,
    wordmarkDataUrl,
  };
  let cursorY = drawTaulamicHeader(doc, headerContext);
  const ensurePageSpace = (requiredHeight: number): void => {
    if (cursorY + requiredHeight <= pageHeight - margin) {
      return;
    }
    doc.addPage();
    cursorY = drawTaulamicHeader(doc, headerContext);
  };

  const approxGuests = parseApproximateGuestCount(input.eventMeta);
  const guestNameById = buildGuestNameById(input);
  const categoryDispersion = buildCategoryDispersion(input);
  const categoryCount = categoryDispersion.filter(
    (category) => category.name.toLowerCase() !== 'sin categoría',
  ).length;
  const coupleSummary = buildCoupleSummary(input);
  const emptyTableCount = input.tableGroups.filter(
    (group) => group.assignedCount <= 0,
  ).length;
  const overCapacityTableCount = input.tableGroups.filter(
    (group) => group.assignedCount > group.capacity,
  ).length;
  const occupancyPercent =
    input.proposal.stats.totalCapacity > 0
      ? (input.proposal.stats.assignedCount / input.proposal.stats.totalCapacity) *
        100
      : 0;
  const compatibilityLabel = input.proposal.compatibilityScore
    ? `${formatPercent(input.proposal.compatibilityScore.globalPercent)}%`
    : 'N/D';
  const cardWidth = (contentWidth - 12) / 2;
  const cardHeight = 54;
  const sectionTitleToBlockGap = 20;
  const coupleTogetherLabel =
    coupleSummary.totalCouples > 0
      ? `Juntas: ${coupleSummary.togetherCouples}/${coupleSummary.totalCouples}`
      : 'Juntas: —';

  const eventData: Array<[string, string]> = [
    ['Fecha', formatMetaDate(input.eventMeta.date)],
    ['Lugar', input.eventMeta.location?.trim() || '—'],
    ['Invitados aproximados', approxGuests > 0 ? String(approxGuests) : '—'],
    ['Invitados reales', String(input.guestTotal)],
    ['Aforo teórico', `${input.proposal.stats.totalCapacity} plazas`],
    [
      'Ocupación actual',
      `${input.proposal.stats.assignedCount} plazas (${formatPercent(occupancyPercent)}%)`,
    ],
    ['Mesas configuradas', String(input.proposal.stats.tableCount)],
    [
      'Compatibilidad global',
      input.proposal.compatibilityScore
        ? `${formatPercent(input.proposal.compatibilityScore.globalPercent)}%`
        : 'N/D',
    ],
    ['Estado', input.proposal.status === 'confirmed' ? 'Confirmada' : 'Borrador'],
    ['Confirmada en', formatDateTime(input.proposal.confirmedAt)],
  ];

  ensurePageSpace(210);
  drawSectionTitle(doc, 'Datos del evento', margin, cursorY);
  cursorY += sectionTitleToBlockGap;

  const eventCardHeight = Math.max(152, 22 + eventData.length * 13);
  doc.setDrawColor(...COLOR_BORDER);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cursorY, contentWidth, eventCardHeight, 8, 8, 'FD');
  cursorY += 16;
  cursorY = writeAlignedKeyValueRows(
    doc,
    eventData,
    margin + 12,
    cursorY,
    contentWidth - 24,
  );
  cursorY += 24;

  drawSectionTitle(doc, 'Notas del evento', margin, cursorY);
  cursorY += sectionTitleToBlockGap;

  const notes = input.eventMeta.notes?.trim() || 'Sin notas registradas';
  const noteLines = toLines(doc, notes, contentWidth - 20);
  const noteRectHeight = Math.max(74, 22 + noteLines.length * 10);
  doc.setDrawColor(...COLOR_BORDER);
  doc.setFillColor(...COLOR_CANVAS);
  doc.roundedRect(margin, cursorY, contentWidth, noteRectHeight, 8, 8, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(noteLines, margin + 10, cursorY + 20);
  cursorY += noteRectHeight + 18;

  ensurePageSpace(cardHeight * 4 + 80);
  drawSectionTitle(doc, 'Resumen general', margin, cursorY);
  cursorY += sectionTitleToBlockGap;

  drawStatCard(
    doc,
    { x: margin, y: cursorY, width: cardWidth, height: cardHeight },
    'Invitados reales',
    String(input.guestTotal),
  );
  drawStatCard(
    doc,
    {
      x: margin + cardWidth + 12,
      y: cursorY,
      width: cardWidth,
      height: cardHeight,
    },
    'Compatibilidad',
    compatibilityLabel,
  );
  cursorY += cardHeight + 12;

  drawStatCard(
    doc,
    { x: margin, y: cursorY, width: cardWidth, height: cardHeight },
    'Mesas configuradas',
    String(input.proposal.stats.tableCount),
  );
  drawStatCard(
    doc,
    {
      x: margin + cardWidth + 12,
      y: cursorY,
      width: cardWidth,
      height: cardHeight,
    },
    'Invitados sin asignar',
    String(input.proposal.stats.unassignedCount),
  );
  cursorY += cardHeight + 12;

  drawStatCard(
    doc,
    { x: margin, y: cursorY, width: cardWidth, height: cardHeight },
    'Mesas vacías',
    String(emptyTableCount),
  );
  drawStatCard(
    doc,
    {
      x: margin + cardWidth + 12,
      y: cursorY,
      width: cardWidth,
      height: cardHeight,
    },
    'Sobrecapacidad',
    String(overCapacityTableCount),
  );
  cursorY += cardHeight + 12;

  drawStatCard(
    doc,
    { x: margin, y: cursorY, width: cardWidth, height: cardHeight },
    'Parejas detectadas',
    String(coupleSummary.totalCouples),
    coupleTogetherLabel,
  );
  drawStatCard(
    doc,
    {
      x: margin + cardWidth + 12,
      y: cursorY,
      width: cardWidth,
      height: cardHeight,
    },
    'Núm. categorías',
    String(categoryCount),
  );
  cursorY += cardHeight + 12;
  cursorY += 12;

  cursorY = drawCategorySummaryFlow(doc, categoryDispersion, {
    x: margin,
    y: cursorY,
    width: contentWidth,
    margin,
    headerContext,
  });
  drawFloorPlanPage(doc, input, headerContext);
  doc.addPage();
  const relationsTop = drawTaulamicHeader(doc, headerContext) + 4;
  drawRelationsBlock(
    doc,
    input,
    margin,
    relationsTop,
    contentWidth,
    guestNameById,
    headerContext,
    margin,
  );
  drawTableDetailsPages(doc, input, headerContext);
  drawPageNumbers(doc);
  doc.save(buildFileName(input.eventName));
}

