# Guía de estilo Taulamic — UX/UI (canónica)

- **Estado:** Vigente (jun 2026)
- **Alcance:** Todo diseño e implementación frontend Taulamic (Figma, web, futuro portal invitado)
- **Principios rectores:** `docs/sdd/SDD-01C-principios-estilo-y-baja-friccion.md`
- **Tokens visuales:** `docs/ux/design-tokens-mvp.md`
- **Componentes código:** `docs/ux/frontend-component-system.md`
- **Mapa pantalla → API:** `docs/ux/handoff-figma-a-frontend.md`

Esta guía **fija las decisiones UX/UI ya adoptadas** en el piloto julio. Cualquier pantalla o componente nuevo debe **cumplirla** salvo enmienda explícita en SDD/ADR aprobada por producto.

---

## 1) Jerarquía documental

| Prioridad | Documento | Rol |
|-----------|-----------|-----|
| 1 | SDD / ADR | Requisitos y decisiones de producto |
| 2 | **Esta guía** | Patrones visuales y de interacción obligatorios |
| 3 | `design-tokens-mvp.md` | Valores de color, tipo, espaciado |
| 4 | `handoff-figma-a-frontend.md` | Detalle por pantalla y contratos API |
| 5 | Specs post-piloto (p. ej. Invitados v2) | Evoluciones planificadas, no sustituyen lo vigente hasta merge |

**Regla:** si Figma o código contradicen esta guía sin ADR, **gana esta guía** hasta que producto apruebe el cambio.

---

## 2) Principios de experiencia (obligatorios)

Derivados de SDD-01C y validación piloto:

1. **Baja fricción** — Menos pasos, menos botones redundantes, guardado implícito donde sea seguro.
2. **Guiado progresivo** — Un objetivo claro por pantalla; el setup avanza por fases (Quién → Dónde → Cómo).
3. **Acción obvia** — «Siguiente» / «Anterior» en flujo setup; CTA primario coral único por zona.
4. **Feedback inmediato** — Toda acción relevante confirma resultado (toast, indicador de guardado o validación visible).
5. **Lenguaje humano** — Microcopy en español claro; evitar jerga técnica y el término «borrador» salvo contexto API interno.
6. **Datos reales** — Sin contenido demo precargado; KPIs en 0 hasta que el organizador configure.
7. **Sobriedad** — Admin operativo: poca decoración, datos y acciones primero (ver §3 modos).

---

## 3) Dos modos de interfaz

| Aspecto | Marketing | Admin (organizador) |
|---------|-----------|---------------------|
| Objetivo | Marca, conversión | Configurar evento y distribución |
| Decoración | Ilustraciones, hero amplio | Mínima |
| Densidad | Generosa (`space-12`, sombras suaves) | Compacta (`card-admin`, bordes `neutral-200`) |
| CTA | `btn-primary` coral destacado | Coral solo en primarios y estados activos |
| Tipografía títulos | Expresivo (`text-display`) | Funcional (`PageHeader`: 17 px semibold) |

**Misma paleta y familia tipográfica** (Inter) en ambos modos.

Clases de referencia: `.card-marketing` vs `.card-admin` en `apps/web/src/app/globals.css`.

---

## 4) Identidad visual (resumen)

Detalle completo en `design-tokens-mvp.md`. Valores implementados en `tailwind.config.ts` y `globals.css`.

### Color

| Rol | Token | Uso típico |
|-----|-------|------------|
| Marca | `primary-500` / `primary-600` | CTA, links activos, selección |
| Texto | `neutral-900` / `neutral-500` | Cuerpo / hints |
| Éxito | `success-500` | Guardado, mesa llena, KPI 100% |
| Atención | `warning-500` | Pendiente, mesa parcial |
| Error | `error-500` | Validación bloqueante, fallos API |
| Info | `info-500` | Avisos piloto, ayuda contextual |

**No depender solo del color:** acompañar con texto o icono (accesibilidad).

Helpers semánticos: `apps/web/src/lib/semantic-ui.ts` — no duplicar clases sueltas en pantallas.

### Tipografía admin (implementada)

| Elemento | Especificación |
|----------|----------------|
| Título pantalla | 17 px, semibold, `neutral-900` (`PageHeader`) |
| Subtítulo | 13 px, `neutral-500` |
| Cuerpo / formularios | 14–16 px |
| Labels campos | 12 px, uppercase, tracking wide (`.label-field`) |
| Botones | 14 px, semibold |

### Forma y espaciado

- **Radius:** inputs y botones `rounded-xl` (12 px); tarjetas admin `rounded-lg`.
- **Bordes admin:** preferir borde `neutral-200` frente a sombra pesada.
- **Grid:** `sm:` / `lg:` en admin; formularios `grid-cols-1` por defecto.

---

## 5) Arquitectura de pantalla admin

### Shell

- **Sidebar fija** (`AdminShell`): logo + «taulamic»; bloque «Evento en curso» solo lectura (sin selector de eventos en piloto).
- **Contenido:** `PageHeader` + cuerpo + navegación setup al pie cuando aplique.

### PageHeader

```tsx
<PageHeader
  title="…"
  subtitle="Paso N del setup: …"
  saveStatus={<SaveStatusIndicator status={…} />}  // opcional
  action={…}  // CTA secundario de pantalla (p. ej. «Ver mesas en plano»)
/>
```

Subtítulo de setup: incluir **número y nombre del paso** para orientación.

---

## 6) Flujo de setup (ADR-018)

Orden canónico (`apps/web/src/lib/setup-flow.ts`):

```
Config → Invitados → Tarjetas (🔒) → Plano → Mesas → Afinidades → Distribución → Dashboard
```

| Fase | Pasos |
|------|-------|
| Quién | Invitados, Tarjetas |
| Dónde | Plano, Mesas |
| Cómo | Afinidades, Distribución |

- Nav **no lineal**: se puede saltar entre pasos desde sidebar.
- Tras **Distribución**, «Siguiente» lleva al **Dashboard** (no a otra pantalla de setup).
- **Tarjetas / invitaciones:** visible pero bloqueada en piloto (`PILOT_INVITATION_DESIGN_LOCKED_HINT`).

### Sin botón «Guardar» genérico

| Paso | Persistencia | Avance «Siguiente» |
|------|--------------|-------------------|
| Config | Auto-save 500 ms + flush en `onBeforeNext` | Bloqueado sin nombre válido |
| Invitados | Alta / import en contenido | Bloqueado con 0 invitados |
| Plano | Local + API 600 ms | Activo tras hidratar |
| Mesas | «Añadir mesa» (acción explícita) | Bloqueado con 0 mesas |
| Afinidades | Toggle reglas → `localStorage` | Siempre activo |
| Distribución | Motor en pantalla | Siempre activo |

**Prohibido** reintroducir «Guardar» / «Guardar y continuar» como patrón principal en estos pasos salvo enmienda SDD.

### SetupNavBar

Componente: `apps/web/src/components/admin/setup-nav-bar.tsx`

- **Desktop:** pie de página, borde superior.
- **Móvil:** **sticky inferior** (`fixed bottom-0`), con espaciador de scroll.
- Controles: `← Anterior` (link) · acción primaria opcional · `Siguiente →`.
- Props clave: `nextReady`, `nextDisabledHint`, `onBeforeNext`, `hidePrimary`.

---

## 7) Patrones de feedback (obligatorios)

Tres capas complementarias — usar la adecuada, no mezclar redundante:

### 7.1 Validación de avance (bloqueo setup)

Cuando `nextReady={false}`:

- Banner **`Alert` variant `error`** encima de la barra de navegación con `nextDisabledHint`.
- Botón «Siguiente» atenuado pero **clicable**: scroll al banner + pulso visual.

| Paso | Mensaje |
|------|---------|
| Config | Indica el nombre del evento para continuar |
| Invitados | Añade al menos un invitado para continuar |
| Mesas | Añade al menos una mesa para continuar |
| Plano (carga) | Espera a que cargue el plano del salón |

### 7.2 Toast (acciones puntuales)

- **Componente:** `useToast()` · `components/ui/toast.tsx` · provider en `app/providers.tsx`.
- **Posición:** arriba centro, `z-[100]`.
- **Duración:** ~4 s, cierre manual con ✕.
- **Variantes:** `success` | `error` | `info` (mismos tokens que `Alert`).

**Usar toast para:** alta/edición/eliminación, import Excel, añadir mesas, descargas.

**No usar toast para:** estados de carga prolongados (usar disabled/spinner en el control) ni errores que requieran lectura larga (combinar toast breve + detalle si hace falta).

### 7.3 Indicador «Guardado automáticamente»

- **Componente:** `SaveStatusIndicator` + `useAutoSaveIndicator()` · slot `saveStatus` en `PageHeader`.
- **Estados:** oculto · «Guardando…» · «Guardado automáticamente» (~3 s, check verde).

| Pantalla | Cuándo |
|----------|--------|
| Config | Debounce + API |
| Plano | Debounce + `saveRoomSetup` |
| Afinidades | Tras toggle de regla genérica (instantáneo, sin «Guardando…») |

**Errores de persistencia:** `Alert` rojo bajo el header (Config, Plano); el indicador vuelve a oculto.

### 7.4 Alert fijo (contexto persistente)

Mantener `Alert` en pantalla cuando el mensaje debe **permanecer visible** mientras el usuario decide:

- Avisos piloto (Afinidades: motor no consume reglas).
- Recomendación tamaño salón (Plano).
- Error de API no resuelto con un solo toast.

---

## 8) Componentes UI obligatorios

Inventario en `frontend-component-system.md`. Primitivos en `apps/web/src/components/ui/`:

| Componente | Uso |
|------------|-----|
| `Alert` | Errores persistentes, avisos piloto |
| `Toast` / `useToast` | Confirmación de acciones |
| `SaveStatusIndicator` | Auto-guardado en cabecera |
| `PageHeader` | Título + subtítulo + slots |
| `EmptyState` | Listas sin datos |
| `SetupNavBar` | Navegación setup |
| `StatCard` | KPIs dashboard |
| `SectionLabel` | Encabezados de bloque en tarjetas |
| `PreferenceOption` | Modo preferencias en Config |
| `UploadZone` | Import archivos |

**Nuevas piezas reutilizables → `ui/`** antes de duplicar en páginas.

---

## 9) Patrones por área

### Dashboard

- KPIs desde **API real** (no metas locales en tarjetas).
- Invitados: total + barra % asignados (verde 100 %, ámbar si faltan).
- Mesas: count API + plazas + «sobran/faltan X plazas» (sin fracción `2/2`).
- **Cuenta atrás evento** (`EventCountdown`): días grandes a la izquierda; horas/minutos dot-matrix a la derecha; ventana progreso 120 días.
- Sin datos demo al crear evento.

### Invitados

- Pantalla canónica: **panel v2** (`GuestsPanelV2` + drawer + import Excel).
- Feedback de acciones: **toast** (no banner fijo superior).
- Separación estricta: datos logísticos aquí; **reglas de seating en Afinidades** (ADR-018).

### Plano

- **Fase A (setup):** forma, medidas, accesorios; sin detección IA de mesas como camino principal (ADR-016).
- **Fase B (layout):** tras distribución; «Ver mesas en plano» solo si hay distribución calculada.
- Auto-guardado + indicador en header; sin «Guardar» en header Fase A.

### Mesas

- Acción principal: **«Añadir mesa»** (no «Guardar mesa»).
- Toast al añadir, renombrar o eliminar.

### Afinidades

- Título: «Afinidades y reglas»; modo de captura solo lectura con enlace a Config.
- Reglas genéricas: toggles tipo tarjeta con borde coral activo.
- Matriz invitado ↔ invitado: placeholder hasta post-piloto.
- Copy piloto honesto: motor v0 no consume reglas aún.

### Distribución

- Vista calculada v2; pills de detalle; sin botón Guardar en nav (`hidePrimary`).

---

## 10) Responsive (ADR-019)

| Superficie | Enfoque |
|------------|---------|
| Marketing | Dual desktop/móvil |
| Admin | Desktop-first (≥ 1024 px), degradar con `sm:`/`lg:` |
| Invitado (futuro) | **Mobile-first 390×844**, touch ≥ 44 px |

Patrones: tablas con fila apilada en móvil; `SetupNavBar` sticky abajo; no depender de `:hover` para acciones críticas.

---

## 11) Microcopy

| Situación | Tono |
|-----------|------|
| Éxito toast | Concreto: «Invitado «María» añadido.» |
| Error | Qué falló + qué puede hacer el usuario |
| Piloto no operativo | «Piloto — …» / «Post-piloto» en badge, sin prometer funcionalidad inexistente |
| Pasos setup | «Paso N del setup: …» en subtítulo |
| Confirmaciones destructivas | `window.confirm` con nombre de entidad |

Evitar: «borrador» en UI de organizador salvo copy técnico interno; «Guardar» cuando el guardado es automático.

---

## 12) Anti-patrones (prohibido sin ADR)

- Botón «Guardar» redundante en pasos con auto-save.
- `Alert` fijo arriba para cada acción exitosa (usar toast).
- Tooltip como única pista de por qué «Siguiente» está deshabilitado.
- KPIs con datos ficticios o denominadores confusos (`2/2` mesas).
- Colores hex sueltos en JSX (salvo SVG/ilustración).
- Lógica de negocio en `app/**/page.tsx` sin extraer a `components/admin/` o hooks.
- Reintroducir lista invitados legacy o ruta `/guests-v2` como principal.
- Plano por autodetección de mesas como flujo principal (ADR-016).

---

## 13) Checklist — nueva pantalla o feature UI

- [ ] ¿Cumple principios §2 y modo admin §3?
- [ ] ¿Usa primitivos `ui/` existentes?
- [ ] ¿Feedback correcto (§7): toast / save indicator / alert / validación nav?
- [ ] ¿`PageHeader` con subtítulo orientativo?
- [ ] ¿Setup en flujo ADR-018 con `SetupNavBar` si aplica?
- [ ] ¿Responsive y touch 44 px si el invitado podría usarlo (ADR-019)?
- [ ] ¿Microcopy en español claro (§11)?
- [ ] ¿Tokens/colores vía Tailwind o `semantic-ui`?
- [ ] ¿Documentado en handoff si cambia contrato pantalla → API?

---

## 14) Referencias cruzadas

| Tema | Documento |
|------|-----------|
| Capas frontend | ADR-021 |
| Flujo setup | ADR-018, `SDD-PILOTO-enmienda-flujo-setup-jun2026.md` |
| Plano dos fases | ADR-016, ADR-020 |
| Design system código | ADR-017, `frontend-component-system.md` |
| Móvil invitado | ADR-019 |
| Invitados v2 futuro | `spec-invitados-panel-v2-post-piloto.md` |
| Figma | `figma-mvp.md`, handoff |

---

## 15) Historial de decisiones (piloto jun 2026)

| Fecha | Decisión | PR / nota |
|-------|----------|-----------|
| 2026-06 | Barra setup, guardado implícito, cuenta atrás dashboard | #40 |
| 2026-06 | Invitados v2 como pantalla principal | #40 |
| 2026-06 | Validación visible + toast + indicador auto-guardado | #41 |
| 2026-06 | Auto-guardado visible en Afinidades | #41 (ext.) |

Actualizar esta tabla cuando se aprueben nuevos patrones globales.
