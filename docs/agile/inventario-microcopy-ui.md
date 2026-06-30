# Inventario microcopy UI — MEJ-13 Fase A

- **Estado:** Aprobado PO (guion `guion-validacion-mej-13-propuesta-microcopy.md`, 2026-06-21)
- **Spec:** `MEJ-13-auditoria-microcopy-y-ayudas.md`
- **Implementación B+C:** `1d3db89` · **Validación manual:** `guion-validacion-mej-13-ui.md`

Matriz de decisiones por string. Criterios: **Mantener** · **Acortar** · **Eliminar** · **Diferir** · **Mover**.

---

## 1) Avisos piloto / post-piloto / post-MVP

| Ubicación | Texto (referencia) | Decisión PO | Estado |
|-----------|-------------------|-------------|--------|
| `distribution-calculated-view.tsx` | Comparador Top-K | **Acortar** → «Comparador Top-K — próximamente» | ✅ `1d3db89` |
| `event-config-view.tsx` | Modo colaborativo | **Mantener** (límite real); «piloto julio» → «piloto actual» | ✅ `1d3db89` |
| `event-config-view.tsx` | Párrafo autoguardado al pie | **Eliminar** (redundante con indicador header) | ✅ `1d3db89` |
| `preferences-affinity-view.tsx` | Borrador / no persisten API | **Mantener** (límite técnico real) | — sin cambio |
| `floor-plan-setup-view.tsx` | «Posicionar con drag — post-MVP» | **Eliminar** | ✅ `1d3db89` |
| `floor-plan-layout-view.tsx` | Avisos post-MVP posiciones | **Eliminar** (si existían) | ✅ MEJ-12 |
| `invitations/page.tsx` | «disponible tras el piloto» | **Mantener** (paso bloqueado HU-10) | — sin cambio |
| `distribution-view.ts` | `PILOT_AFFINITY_LABEL` | **Diferir** renombre hasta motor afinidad | — sin cambio |
| `nav-map/page.tsx` | «MVP piloto julio» | **Diferir** → actualizado «piloto actual» post-S07 | ✅ post-S07 |
| `marketing-*` | «Acceder al piloto», segmentos | **Mantener** / honesto | — sin cambio |
| `guests-panel-v2.tsx` | «Próximamente — no operativo en piloto» | **Mantener** (Tarjetas bloqueadas) | — sin cambio |
| `setup-journey.tsx` | «Próximamente» en Tarjetas | **Mantener** | — sin cambio |

---

## 2) Subtítulos y ayudas por pantalla

| Pantalla | Patrón | Decisión PO | Estado |
|----------|--------|-------------|--------|
| Setup (Config, Invitados, …) | «Paso N del setup: …» | **Mantener** | — sin cambio |
| Plano Fase A | Accesorios sin roadmap post-MVP | **Eliminar** párrafos roadmap | ✅ `1d3db89` |
| Distribución | Empty states | **Mantener** | — sin cambio |
| Dashboard KPIs | hints clicables | **Mantener** | — sin cambio |
| Setup nav bloqueo | `nextDisabledHint` | **Mantener**; presentación compacta encima footer | ✅ `a4fee82` |

---

## 3) Etiquetas responsive (`< md`)

| Control | Completo | Corto | Decisión | Estado |
|---------|----------|-------|----------|--------|
| Confirmar distribución | Confirmar distribución | Confirmar | **Acortar** + `aria-label` | ✅ `1d3db89` |
| Calcular distribución | Calcular distribución | Calcular | **Acortar** + `aria-label` | ✅ `1d3db89` |
| Ver mesas en plano | Ver mesas en plano | Ver plano | **Acortar** + `aria-label` | ✅ `1d3db89` |
| Setup nav Anterior/Siguiente | Texto completo | ← / → | **Acortar** (pre-S07) | ✅ pre-trabajo |
| Recalcular | Recalcular | — | **Mantener** (ya corto) | — |

**Patrón:** `ResponsiveButtonLabel` en `components/ui/responsive-button-label.tsx`.

---

## 4) Claridad vs longitud (matriz PO)

| Regla | Aplicación |
|-------|------------|
| Acortar solo si el `PageHeader` o el paso setup desambigua | Botones Distribución / Plano |
| No eliminar avisos de funcionalidad bloqueada | Tarjetas, colaborativo, matriz afinidades |
| «Piloto actual» sustituye «piloto julio» cuando el límite sigue vigente | Config |
| Eliminar copy que duplica auto-save o checklist | Párrafo Config eliminado |

---

## 5) Pendiente post-Sprint 07

| Item | Acción |
|------|--------|
| `nav-map/page.tsx` copy «piloto julio» | ✅ post-S07 — mapa dev interno |
| `PILOT_AFFINITY_LABEL` | Diferir — depende motor afinidad |
| Fase D centralización `lib/ui-copy.ts` | Opcional P3 — no iniciado |
| §11 guía lifecycle piloto → producto | Actualizar al cerrar piloto bodas |

---

## 6) Referencias

- Guion propuesta: `guion-validacion-mej-13-propuesta-microcopy.md`
- Validación manual: `guion-validacion-mej-13-ui.md`
- Guía §11: `guia-estilo-taulamic.md`
