# MEJ-13 — Auditoría de microcopy y textos de ayuda

- **Validación manual:** 2026-06-21 — **APROBADO** (PO) · `evidencias-mej-13-validacion.md`
- **Inventario:** `inventario-microcopy-ui.md`
- **Tipo:** Mejora UX copy (sin cambio de alcance funcional salvo acuerdo PO)
- **Origen:** Revisión responsive — simplificar ayudas y botones en espacio reducido; retirar referencias «piloto» obsoletas cuando corresponda
- **Guion validación previa:** `guion-validacion-mej-13-propuesta-microcopy.md`
- **Referencias:** `guia-estilo-taulamic.md` §11 Microcopy, ADR-019

---

## 1) Principio rector

**La claridad manda.** Cualquier acortamiento o eliminación de texto debe pasar un filtro explícito: el organizador debe seguir entendiendo qué hace la acción, qué falta por completar y qué está fuera de alcance.

No optimizar longitud a costa de ambigüedad. En duda, mantener el texto completo en desktop y solo acortar en viewport reducido con `aria-label` / tooltip si hace falta.

---

## 2) Objetivo

Dos ejes complementarios:

1. **Inventario y poda de ayudas** — mensajes contextuales, subtítulos, hints, avisos «piloto» / «post-piloto» / «post-MVP» que ya no aporten o repitan información obvia tras cerrar fases del piloto.
2. **Etiquetas responsive de botones** — variantes cortas en `< md` o ancho útil reducido (p. ej. «Confirmar» vs «Confirmar distribución»), con texto completo accesible.

---

## 3) Fuera de alcance

| Exclusión | Motivo |
|-----------|--------|
| Cambiar mensajes de error API | Backend / contrato |
| Ocultar avisos de funcionalidad **realmente** no operativa | SDD exige copy honesto (§11 guía) |
| Traducción / i18n | Post-MVP |
| Reescritura marketing landing | Fuera admin |

---

## 4) Inventario inicial (borrador — auditar en Fase A)

### 4.1 Avisos «piloto / post-piloto / post-MVP»

| Ubicación | Texto actual | Valorar |
|-----------|--------------|---------|
| `distribution-calculated-view.tsx` | «Comparador Top-K — disponible post-piloto» | ¿Eliminar, acortar o mover a docs? |
| `event-config-view.tsx` | «Piloto julio: solo anfitrión exclusivo… post-piloto» | ¿Mantener mientras modo colaborativo no exista? |
| `preferences-affinity-view.tsx` | «Piloto — vista previa del flujo»; «no persisten en API hasta post-piloto» | ¿Sigue siendo verdad técnicamente? |
| `floor-plan-layout-view.tsx` | «…post-MVP» (guardar posiciones) | ¿Acortar a tooltip? |
| `floor-plan-setup-view.tsx` | «Posicionar con drag — post-MVP» | Idem |
| `invitations/page.tsx` | «disponible tras el piloto» | Paso bloqueado — mantener badge |
| `distribution-view.ts` | `N/D piloto` / «No calculado en piloto» | ¿Renombrar cuando motor afinidad evolucione? |
| `nav-map/page.tsx` | «MVP piloto julio», badges «Piloto jul» | Mapa interno — baja prioridad |
| `marketing-*` | «Piloto julio» | Marketing — revisión aparte |

### 4.2 Subtítulos y ayudas por pantalla

| Pantalla | Patrón | Valorar |
|----------|--------|---------|
| Todas setup | «Paso N del setup: …» | ¿Útil o redundante con sidebar + checklist? |
| Plano Fase B | Párrafo largo drag + post-MVP | Dividir: acción vs roadmap |
| Distribución | Empty state descriptivo | OK — revisar longitud |
| KPIs / StatCard | hints clicables | Mantener si aportan acción |

### 4.3 Candidatos a etiqueta corta en móvil

| Botón / control | Completo | Corto propuesto | Riesgo claridad |
|-----------------|----------|-----------------|-----------------|
| Confirmar distribución | Confirmar distribución | Confirmar | Bajo (contexto pantalla) |
| Calcular distribución | Calcular distribución | Calcular | Medio |
| Ver mesas en plano | Ver mesas en plano | Ver plano | Bajo |
| Recalcular | Recalcular | Recalcular | — (ya corto) |
| Setup nav | Anterior: X / Siguiente: Y | ← / → | Implementado (MEJ-13 relacionado) |

**Regla propuesta:** etiqueta corta solo si el `PageHeader` o breadcrumb deja claro el contexto.

---

## 5) Criterios de decisión (obligatorios antes de cambiar)

Para cada string, marcar una de:

| Decisión | Cuándo |
|----------|--------|
| **Mantener** | Sigue informando de límite real o acción no obvia |
| **Acortar** | Redundante con UI visible; versión corta + `aria-label` |
| **Eliminar** | Obvio por contexto o duplica sidebar/checklist |
| **Diferir** | Depende de feature post-piloto aún no entregada |
| **Mover** | De inline a tooltip, leyenda o doc de ayuda |

**Prohibido** eliminar aviso de funcionalidad bloqueada sin sustituto (badge, candado, empty state).

---

## 6) Alcance propuesto (fases)

### Fase A — Inventario (P0)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-13-A1 | Hoja `inventario-microcopy-ui.md` | Todos los strings §4 + decisión PO |
| MEJ-13-A2 | Matriz claridad vs longitud | PO firma guion propuesta |

**Gate:** PO aprueba guion antes de editar JSX.

### Fase B — Poda ayudas piloto (P1)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-13-B1 | Eliminar/acortar según inventario | Sin regresión en tests E2E de copy crítico |
| MEJ-13-B2 | Actualizar §11 guía estilo | Reglas lifecycle «piloto → producto» |

### Fase C — Botones responsive (P2)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-13-C1 | Patrón `ResponsiveButtonLabel` o util CSS | Texto corto `< md`, completo `aria-label` |
| MEJ-13-C2 | Pilotar en Distribución + 2 pantallas | PO valida guion post-implementación |

### Fase D — Centralización (P3, opcional)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-13-D1 | Constantes copy en `lib/ui-copy.ts` | Evitar strings dispersos |

---

## 7) Criterios de aceptación globales

1. Ningún botón primario queda ambiguo fuera de su pantalla.
2. Funcionalidad no operativa sigue visible (badge, candado o hint mínimo).
3. Referencias «piloto julio» solo donde el límite sigue vigente.
4. Variantes móvil tienen `aria-label` con texto completo.
5. Checklist §13 guía estilo actualizado.

---

## 8) Relación con otros MEJ

| MEJ | Relación |
|-----|----------|
| MEJ-10 | Cohesión visual; copy en chips/tablas |
| MEJ-11/12 | Dashboard y plano; subtítulos incluidos en inventario |
| Setup nav flechas | Ya en código; inventario debe listarlo como hecho |

---

## 9) Estimación

| Fase | Esfuerzo |
|------|----------|
| A Inventario + PO | S |
| B Poda ayudas | S–M |
| C Botones responsive | S |
| D Centralización | M |

---

## 10) Historial

| Fecha | Evento |
|-------|--------|
| 2026-06-21 | Propuesta documentada (feedback PO microcopy + claridad) |
| 2026-06-21 | Inventario PO (`inventario-microcopy-ui.md`); B+C en `1d3db89` |
