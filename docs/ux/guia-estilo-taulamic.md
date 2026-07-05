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

- **Sidebar:** fija en `lg+` (`AdminShell`); en `< lg` menú **hamburguesa** + drawer con las mismas secciones (ADR-019).
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
- **Viewport estrecho / móvil (`dense`, `< md`):** solo flechas `←` / `→` en la banda fija; etiqueta completa en `aria-label` + `title` (p. ej. «Anterior: Afinidades»). Desde `md`: texto completo con `truncate` si hace falta.
- Props clave: `nextReady`, `nextDisabledHint`, `onBeforeNext`, `hidePrimary`.

**Alineación con sidebar (obligatorio):** la banda inferior del contenido (`admin-setup-bar-shell`) y el bloque «Mapa navegación» del sidebar comparten la misma clase, altura (`--admin-setup-bar-height`) y `border-t` a la misma altura de viewport. El banner de bloqueo setup (`Alert` cuando `nextReady={false}`) va **encima** de esa banda en el área principal, **no dentro**, para no desalinear la línea horizontal. En el footer fijo (`dense`), **Anterior** y **Siguiente** van siempre en **fila** dentro de la banda (sin apilar en `flex-col`); textos largos con `truncate`. Si no hay paso anterior (p. ej. Config), **Siguiente** alineado a la **derecha** (`justify-end`).

---

## 7) Patrones de feedback (obligatorios)

Tres capas complementarias — usar la adecuada, no mezclar redundante:

### 7.1 Validación de avance (bloqueo setup)

Cuando `nextReady={false}`:

- Hint compacto (`setup-nav-blocked-hint`) **encima** de la barra fija, alineado a la derecha con el botón «Siguiente»; tokens `feedback-surface-error`.
- Botón «Siguiente» atenuado pero **clicable**: scroll al hint + pulso visual (`ring`).

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
- **Variantes:** `success` | `error` | `info` (superficies opacas `feedback-surface-*`; no fondos `/10` sobre contenido).

**Usar toast para:** alta/edición/eliminación, import Excel, añadir mesas, descargas.

**No usar toast para:** estados de carga prolongados (usar disabled/spinner en el control) ni errores que requieran lectura larga (combinar toast breve + detalle si hace falta).

### 7.3 Indicador «Guardado automáticamente»

- **Componente:** `SaveStatusIndicator` + `useAutoSaveIndicator()` · slot `saveStatus` en `PageHeader`.
- **Estados:** oculto (reservando espacio visual invisible para evitar CLS) · «Guardando…» · «Guardado automáticamente» (~3 s, check verde).

| Pantalla | Cuándo | Comportamiento Híbrido / Red de Seguridad |
|----------|--------|-------------------------------------------|
| Config | Debounce 2s + API | **Híbrido**: Solo tras interactuar (dirty flag). Al cerrar pestaña (`beforeunload`) o cambiar de ruta (desmontaje), se fuerza un guardado inmediato para evitar pérdidas. |
| Plano | Debounce + `saveRoomSetup` | Debounce 600ms. |
| Afinidades | Tras toggle de regla genérica | Guardado instantáneo en localStorage sin «Guardando…». |

**Estabilidad Visual (Evitar CLS):** El componente `SaveStatusIndicator` en estado `idle` no debe retornar `null`. Debe renderizar un elemento invisible (`visibility: hidden`) con las mismas dimensiones para asegurar que no se produzcan saltos en el layout (CLS).

**Errores de persistencia:** `Alert` rojo bajo el header (Config, Plano); el indicador vuelve a oculto.

### 7.4 Alert fijo (contexto persistente)

Mantener `Alert` en pantalla cuando el mensaje debe **permanecer visible** mientras el usuario decide:

- Avisos piloto (Afinidades: motor no consume reglas).
- Recomendación tamaño salón (Plano).
- Error de API no resuelto con un solo toast.

### 7.5 Feedback contextual (subzona)

Mensajes **pegados al control o fila** donde ocurre la acción — no toast ni banner de página.

| Caso | Patrón | Ejemplo |
|------|--------|---------|
| Validación de campo inline | Texto `text-xs text-error-500` bajo el input | Etiqueta mesa vacía o duplicada |
| Resultado de drag/drop o mutación local | Superficie compacta tipo `Alert` (`feedback-surface-*`, `rounded-xl`) en la fila o panel | Distribución: mover invitado, warning acompañantes |
| Confirmación destructiva con contexto | `ConfirmDialog` modal | Eliminar mesa con invitados asignados en distribución |

**Árbol de decisión:**

1. ¿Afecta a toda la pantalla o bloquea setup? → §7.1 / §7.4  
2. ¿Acción puntual y el cambio no es obvio? → §7.2 Toast  
3. ¿Acción en subzona (fila, panel, input)? → **§7.5 contextual**  
4. ¿El cambio ya es visible sin texto? → Sin mensaje adicional  

**Implementación:** `placement-mutation-feedback.tsx`, validación inline en formularios; reutilizar tokens `feedback-surface-*` de `semantic-ui.ts`.

**Chips de filtro (canónico):** activo = borde `primary-500` + fondo `primary-500/10` + texto `primary-700` (`filterChipClass` en `semantic-ui.ts`). Aplicar en Distribución, Plano e Invitados.

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
- **Proyecto evento:** el primer paso natural desde el dashboard es **Configuración** (`/config`) — unidad que con persistencia futura será guardable/recuperable.
- **Recorrido del setup** (`SetupJourney`): línea vertical con nodos por paso; check verde si completado, círculo neutro si pendiente; cada nodo clicable salvo bloqueados (Tarjetas).
- **CTA contextual** (`SetupNavBar` variant `inline`): entre KPIs y checklist; navega al **siguiente paso incompleto** del setup (`getDashboardSetupNav`).
- **Footer setup** (`SetupNavBar` sticky): «Siguiente: …» hacia el paso siguiente; flecha en móvil, texto desde `md`.
- **Accesos rápidos:** eliminados Sprint 07 (decisión PO); sidebar + CTA + checklist cubren navegación.

### Invitados

- Pantalla canónica: **panel v2** (`GuestsPanelV2` + drawer + import Excel).
- Feedback de acciones: **toast** (no banner fijo superior).
- Separación estricta: datos logísticos aquí; **reglas de seating en Afinidades** (ADR-018).

### Plano

- **Fase A (setup):** forma, medidas, accesorios; sin detección IA de mesas como camino principal (ADR-016).
- **Fase B (layout):** tras distribución; «Ver mesas en plano» solo si hay distribución calculada.
- **Marcadores mesa (MEJ-12):** rejilla fija + escala dinámica; chips compactos con borde visible; detalle en panel lateral al **un clic**; tooltip con `n/cap`.
- Auto-guardado + indicador en header; sin «Guardar» en header Fase A.

### Mesas

- Patrón **formulario + inventario** (no clonar Invitados v2).
- Acción principal: **«Añadir mesa»** (no «Guardar mesa»).
- Renombrar etiqueta: edición **inline** en fila; error vacío/duplicado **bajo el input** (§7.5).
- Eliminar mesa con invitados: **`ConfirmDialog`** (no `window.confirm`).
- Toast al añadir, renombrar o eliminar con éxito.

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
| Admin | Desktop-first (**≥ 1024 px** / `lg`), degradar en tablet y móvil |
| Invitado (futuro) | **Mobile-first 390×844**, touch ≥ 44 px |

Patrones admin móvil (`< lg`):

- Listas densas: **cards apiladas** (invitados, mesas); tabla/grid desde `lg`.
- Drawer navegación (`AdminShell`); sidebar fija `lg+`.
- Plano Fase A: controles `FloorPlanMobileControls` + `RoomDimensionFields`; vista previa sin tirador resize.
- Componentes compartidos: `guests/shared/` (RSVP, alertas), `floor-plan/room-dimension-fields.tsx`.
- Plan de refactor: `docs/agile/refactor-ui-mobile-admin.md`.

Patrones generales: `SetupNavBar` sticky abajo con flechas solas `< md`; no depender de `:hover` para acciones críticas.

---

## 11) Microcopy

| Situación | Tono |
|-----------|------|
| Éxito toast | Concreto: «Invitado «María» añadido.» |
| Error | Qué falló + qué puede hacer el usuario |
| Piloto no operativo | «Piloto — …» / «Post-piloto» en badge, sin prometer funcionalidad inexistente |
| Pasos setup | «Paso N del setup: …» en subtítulo |
| Confirmaciones destructivas | `ConfirmDialog` con nombre de entidad |
| Etiquetas responsive | Texto corto solo `< md` si el contexto de pantalla desambigua; `aria-label` con texto completo (ver `MEJ-13-auditoria-microcopy-y-ayudas.md`) |
| Lifecycle piloto | Revisar ayudas «piloto» / «post-piloto» cuando el límite deje de ser cierto — auditoría MEJ-13 antes de podar |
| Copy canónico admin | Strings acordados en `apps/web/src/lib/ui-copy.ts` (MEJ-13 D); no duplicar en componentes |

Evitar: «borrador» en UI de organizador salvo copy técnico interno; «Guardar» cuando el guardado es automático; acortar botones sin criterio de claridad (§ MEJ-13).

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
| 2026-06 | MEJ-10: §7.5 contextual, chips outline, mesas inline + ConfirmDialog | `4890625` |
| 2026-06 | MEJ-11/12/13 + aviso setup compacto | `8a79138`…`a4fee82` |

Actualizar esta tabla cuando se aprueben nuevos patrones globales.
