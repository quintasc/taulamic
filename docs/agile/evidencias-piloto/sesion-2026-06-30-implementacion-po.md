# Implementación pulido PO — 2026-06-30

- **Origen:** observaciones `sesion-2026-06-24.md` (secciones B Invitados, D Plano, patrones UX móvil)
- **Tipo:** refinamiento UI / responsive (sin cambio SDD)
- **Plan:** `sprint-10-plan.md`

---

## Entregas

### Navegación y shell admin

| Cambio | Archivos |
|--------|----------|
| Botón «Anterior» legible en footer setup móvil (`btn-secondary-compact` en modo `dense`) | `setup-nav-bar.tsx` |
| Logo `TaulamicLogo compact` en cabecera `< lg`; oculto con drawer abierto (evita duplicado) | `admin-shell.tsx` |
| Nombre del evento a la derecha con hueco simétrico al botón hamburguesa | `admin-shell.tsx` |
| Indicador dev Next.js en esquina inferior derecha | `next.config.ts` |

### Invitados — importación y estética

| Cambio | Archivos |
|--------|----------|
| Botón fichero dentro de zona de arrastre; «Importar» debajo alineado | `upload-zone.tsx`, `guests-import-section.tsx` |
| Sin fichero: «Seleccionar archivo» primario; import deshabilitado primario | `upload-zone.tsx`, `guests-import-section.tsx` |
| Con fichero: nombre + cruz dentro del mismo botón secundario; import primario | `upload-zone.tsx`, `guests-import-section.tsx` |
| Fila plantilla Excel unificada (`GuestTemplateFileRow`) | `guest-template-file-row.tsx`, `guests-import-section.tsx`, `guests-panel-v2.tsx` |
| Drawer alta manual: portal z-index, ancho móvil, offset footer setup | `guest-drawer-v2.tsx` |

### Plano — móvil / iPad

| Cambio | Archivos |
|--------|----------|
| Límites de escala según contenedor (`computeRoomFitMeterLimits`, `clampSetupToFitLimits`) | `floor-plan-setup.ts` |
| Steppers ± en campos de dimensión móvil | `room-dimension-fields.tsx` |
| Accesorios móvil: carril con chevrones ‹ › visibles (scroll oculto) | `mobile-horizontal-scroll.tsx`, `floor-plan-mobile-controls.tsx`, `ui/index.ts` |
| Valores por defecto desde invitados aproximados (hydrate 404) | `floor-plan-setup-view.tsx` |
| Accesorios redonda/ovalada desktop: slots elipse 30 % | `floor-plan-setup.ts` (resolveAccessoryLayouts) |

### Tests

| Cambio | Archivos |
|--------|----------|
| Smoke MEJ-13 D + menú hamburguesa + copy distribución móvil | `mej-13-ui-copy.spec.ts` |
| Helper piloto robusto | `pilot-flow.ts` |

---

## Pendiente validación PO

- [ ] Invitados paso 2: flujo seleccionar → importar → quitar fichero
- [ ] Cabecera móvil/iPad: logo + nombre evento sin solapamiento
- [ ] Plano móvil: steppers y tope al no caber en pantalla
- [ ] Distribución móvil: flechas Anterior/Siguiente visibles
- [ ] Repaso `guion-validacion-piloto-ui.md` completo

---

## Pendiente desarrollo (no bloquea commit)

- Fases 2–4 `refactor-ui-mobile-admin.md` (primitivos transversales, descomposición monolitos)
- Smoke PO visual MEJ-13 D manual (E2E ya verde)
- Accesorios `(x,y)` — gate SDD
