# SDD piloto — Alineacion y huecos (jun 2026)

- Ultima actualizacion: **2026-06-23**
- Commits referencia: **`f873ffb`** (docs SDD/ADR) · **`0f15b37`** (web plano/mesas) — `main`
- Fuentes: `SDD-01-borrador-mvp.md`, `handoff-figma-a-frontend.md`, `ADR-016`, `DECISION-002`, `PRD-v1.md`

Este documento **no sustituye** el SDD-01; resume cumplimiento del **piloto julio** frente al MVP completo.

---

## Leyenda

| Simbolo | Significado |
|---------|-------------|
| ✅ | Cumple piloto / criterio clave |
| 🟡 | Parcial (piloto aceptable; falta MVP) |
| ⬜ | No en piloto (documentado fuera de alcance) |
| ⚠️ | Requiere atencion (copy, API o gobernanza) |

---

## Historias de usuario (SDD-01)

| HU | Titulo | Piloto | Notas |
|----|--------|--------|-------|
| HU-01 | Configurar mesas | 🟡 | Forma, capacidad, etiqueta, cantidad M1…n, editar etiqueta. Falta: disposicion visual completa de asientos en admin |
| HU-02 | Perfil social invitado | ⬜ | Sin portal invitado |
| HU-03 | Necesidades especiales | 🟡 | API restricciones; UI admin limitada |
| HU-04 | Calcular distribucion | 🟡 | Motor v0 + confirmar; sin estado async elaborado ni Top-K |
| HU-05 | Ajuste manual | ⬜ | Sin mover invitados ni ✕/+ en UI (handoff §7) |
| HU-06 | Aprobar y versionar | 🟡 | Confirmar distribucion; sin versionado rico |
| HU-07 | Visibilidad invitados | ⬜ | Sin publicacion programada |
| HU-08 | Documentos salon/cocina | ⬜ | Post-MVP |
| HU-09 | Comparar Top-K | ⬜ | Post-MVP |
| HU-10–11 | Invitaciones / RSVP | ⬜ | Post-MVP |
| HU-12 | Plano salon | 🟡 | **Redefinida ADR-016:** Fase A/B OK en piloto; sin fondo IA ni drag-drop |
| HU-13–14 | Excel plantilla / import | ✅ | API + UI piloto |
| HU-15 | Mapeo observaciones | 🟡 | API sugerencias; UI parcial |
| HU-16 | Modo preferencias | ✅ | Colaborativo / anfitrion exclusivo |
| HU-17 | Acompanantes juntos | 🟡 | Motor v0; regla en API |

---

## Flujos SDD-01 (piloto)

| Flujo | Estado | Comentario |
|-------|--------|------------|
| A — Configuracion inicial | 🟡 | Evento + mesas + prefs; plano Fase A |
| B — Captura invitados | 🟡 | Excel; sin invitado self-service |
| C — Calculo y revision | 🟡 | Run + lista; sin Top-K ni ajuste manual visual |
| D — Aprobacion y publicacion | 🟡 | Confirmar distribucion; sin publicar a invitados |
| E — Documentacion | ⬜ | |
| F — RSVP | ⬜ | |
| G — Plano salon | 🟡 | **ADR-016:** espacio + layout mesas; no detectar mesas en UI |
| H — Excel invitados | ✅ | |
| I — Modo preferencias | ✅ | |

---

## Plano (ADR-016) — checklist implementacion

| Requisito | Piloto | Implementacion |
|-----------|--------|----------------|
| Forma rectangular / redonda / ovalada | ✅ | `floor-plan-setup.ts` |
| Medidas en m + tirador | ✅ | `resizable-room-canvas.tsx` |
| Persistencia layout salon | 🟡 | `localStorage`; API pendiente |
| Accesorios catalogo | 🟡 | Toggle lista; sin drag en canvas |
| Fondo JPG/PNG/PDF | ⬜ | Post-piloto |
| Ver mesas post-distribucion | ✅ | `/floor-plan/layout` |
| Color por ocupacion | ✅ | `floor-plan-layout-view.tsx` |
| Clic → invitados | ✅ | Panel flotante + sidebar |
| Drag-drop posiciones | ⬜ | Post-MVP |
| API `floor-plans` detect mesas | ⬜ | Backend existe; UI principal no usa |

---

## Reglas de negocio §7.1 (duras)

| Regla | Piloto |
|-------|--------|
| No superar capacidad mesa | ✅ Motor v0 |
| Posiciones validas por forma | 🟡 Topologia API; asignacion por mesa no por asiento en UI |
| Acompanantes juntos | 🟡 Motor v0 |
| Incompatibilidades | 🟡 |
| Accesibilidad obligatoria | 🟡 API parcial |
| Bloqueos manuales admin | ⬜ Sin UI bloqueo invitados |
| No publicar tras evento | N/A en piloto |
| Modo anfitrion exclusivo | ✅ |

---

## Honestidad de UI (handoff)

| Elemento | Estado |
|----------|--------|
| Afinidad % como dato real | ⚠️ Debe mostrarse «No calculado en piloto» / estimacion visual |
| KPI Dashboard v2 | 🟡 Verificar Invitados/Mesas/plazas vs handoff |
| Excel sin `preferencia_control` | ⚠️ Pendiente aprobacion cambio spec plantilla |
| Theming / white-label runtime | ⬜ Post-MVP — `ADR-017`; piloto usa `brand.config.ts` fijo |

---

## Prioridad siguiente (sugerida)

1. API persistencia layout salon (Fase A).
2. Fondo opcional + accesorios en canvas.
3. Dashboard KPIs v2 si aun incompletos.
4. Fase B: drag-drop + guardar posiciones.
5. HU-05: edicion manual invitados en distribucion.

---

## Como usar este doc al reanudar

Pegar en el chat:

```text
Continuamos Taulamic desde main (f873ffb). Docs alineados con ADR-016. Lee docs/sdd/SDD-PILOTO-alineacion-y-huecos.md.