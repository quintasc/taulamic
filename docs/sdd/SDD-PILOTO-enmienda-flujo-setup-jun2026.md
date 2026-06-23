# SDD piloto — Enmienda flujo de setup (jun 2026)

- **Fecha:** 2026-06-21
- **Estado:** Aprobada por PO (solicitud explícita en sesión de producto)
- **Relacionado:** `SDD-PILOTO-alineacion-y-huecos.md`, `SDD-01-borrador-mvp.md`, `ADR-016`, `handoff-figma-a-frontend.md`
- **ADR:** `docs/adr/ADR-018-preferencias-afinidades-y-flujo-setup.md`

Esta enmienda **no sustituye** el SDD-01. Refina el **flujo de configuración del piloto julio** y anticipa pantallas de capacidades post-MVP con UI mock donde corresponda.

---

## 1. Resumen de la propuesta (revisión producto)

| Propuesta | Valoración | Decisión |
|-----------|------------|----------|
| Nombre del evento sin valor por defecto; placeholder de ejemplo; KPI setup arranca en 0 % | ✅ Acertada | El nombre interno de API puede ser técnico (`Evento nuevo`); el organizador debe **guardar configuración** con un nombre real para marcar el paso 1 |
| Sustituir «Nº de mesas» por **invitados aproximados** en configuración | ✅ Acertada | El número de mesas sin capacidad no informa planificación; los invitados aproximados orientan plano y mesas |
| Orden: Config → Plano → Invitados → Mesas → Afinidades → Distribución | ✅ Acertada | Alinea dependencias: volumen → espacio → lista → capacidad → restricciones → motor |
| Plano con **tamaño mínimo recomendado** según invitados | ✅ Acertada | Hint orientativo (~1,5 m²/plaza sentada + circulación); no bloquea guardar |
| Alta manual de invitados (+1, última hora) | ✅ Acertada | API `POST /guests` ya existe; piloto habilita formulario |
| Iconos RSVP (confirmado / rechazado / pendiente) | ✅ Acertada (mock piloto) | Visible y editable por organizador; operativo con envío real post-MVP |
| Menú de acciones (invitaciones, etc.) | ✅ Acertada (mock piloto) | Visible, deshabilitado o «Próximamente» |
| Modo colaborativo/exclusivo en **configuración** | ✅ Acertada | HU-16; **piloto julio: solo anfitrión exclusivo** (colaborativo deshabilitado UI) |
| Preferencias = afinidades + reglas genéricas | ✅ Acertada (evolución) | Alimenta motor futuro; piloto muestra estructura sin motor completo |

---

## 2. Flujo de setup (piloto)

| Paso | Clave | Criterio «hecho» (piloto) | Operativo |
|------|-------|---------------------------|-----------|
| 1 | `config` | Organizador guarda configuración con nombre, invitados aprox. y modo de preferencias | ✅ Parcial (meta local + API nombre/modo) |
| 2 | `plano` | Plano Fase A guardado (`localStorage` / setup persistido) | ✅ |
| 3 | `guests` | ≥ 1 invitado (Excel o alta manual) | ✅ |
| 4 | `tables` | ≥ 1 mesa configurada | ✅ |
| 5 | `prefs` | Borrador de afinidades/reglas guardado (meta local) | 🟡 Mock |
| 6 | `dist` | Distribución calculada o confirmada | ✅ Motor v0 |

**KPI setup:** `pasos_completados / 6 × 100`. Sin configuración guardada → **0 %**.

---

## 3. Requisitos funcionales (enmienda)

### RF-P01 — Configuración del evento

- **RF-P01.1** El formulario de configuración no muestra nombre pre-rellenado si el evento usa nombre técnico de creación.
- **RF-P01.2** Placeholder visible: *«Ej. Boda García-López»*.
- **RF-P01.3** Campo **Invitados aproximados** (entero ≥ 0); sustituye «Nº de mesas» en esta pantalla.
- **RF-P01.4** Selector **Modo de preferencias**: colaborativo | anfitrión exclusivo. **Piloto julio:** solo `anfitrion_exclusivo` seleccionable; colaborativo visible deshabilitado (post-piloto).
- **RF-P01.5** Al guardar, persistir nombre en API, modo en API y resto en meta UI local; marcar `configSaved`.

### RF-P02 — Plano del salón

- **RF-P02.1** Si hay invitados aproximados, mostrar recomendación de superficie mínima y dimensiones orientativas.
- **RF-P02.2** Tras guardar, navegar a Invitados.

### RF-P03 — Lista de invitados

- **RF-P03.1** Botón **Añadir invitado** (formulario manual; API existente).
- **RF-P03.2** Columna/icono **RSVP**: confirmado | rechazado | pendiente. Solo significativo si `invitación enviada`; en piloto el organizador puede cambiar el estado (meta local).
- **RF-P03.3** Menú **Acciones** (global y por fila): enviar invitaciones, recordatorios, etc. — visible, no operativo en piloto.

### RF-P04 — Preferencias (afinidades y reglas)

- **RF-P04.1** Pantalla dedicada a **afinidades e incompatibilidades** por persona y **reglas genéricas** (agrupar por categoría, familias unidas, mesa solteros, …).
- **RF-P04.2** En modo colaborativo (futuro): restricciones enviadas por invitados. En exclusivo: las marca el organizador.
- **RF-P04.3** Piloto: UI de borrador; toggles en meta local; motor v0 no consume estas reglas aún.

---

## 4. Matriz piloto vs post-MVP

| Capacidad | Piloto julio | Post-MVP |
|-----------|--------------|----------|
| Nombre sin default + setup 0 % | ✅ | ✅ |
| Invitados aproximados | Meta local | Persistencia API evento |
| Hint tamaño plano | Orientativo | Validación opcional / alertas |
| Alta manual invitados | ✅ API | ✅ + edición completa |
| RSVP / invitaciones | UI mock | HU-10, HU-11, Flujo F |
| Afinidades por persona | UI mock | Motor + portal invitado |
| Reglas genéricas | UI mock | Motor v1+ |
| Modo colaborativo/exclusivo | Solo **anfitrión exclusivo** en UI | Ambos modos (HU-16) |
| Diseño responsive invitado (mobile-first) | Criterios RF-P05; portal no operativo | ADR-019; portal `/guest` |

---

## 5. Criterios de aceptación (piloto)

1. Evento nuevo muestra setup **0 %** hasta guardar configuración con nombre real.
2. Configuración no pide número de mesas; sí invitados aproximados. Modo de preferencias fijado a **anfitrión exclusivo** (colaborativo deshabilitado).
3. Plano muestra hint de tamaño cuando hay invitados aproximados.
4. Invitados: alta manual funcional; iconos RSVP y menú acciones visibles (acciones masivas no operativas).
5. Preferencias: sin selector de modo; muestra secciones de afinidades y reglas con aviso de piloto.
6. Checklist y navegación siguen orden: Config → Plano → Invitados → Mesas → Preferencias → Distribución.

---

## 6. Impacto en documentación existente

- Actualizar `SDD-PILOTO-alineacion-y-huecos.md` (flujo A, HU-16 ubicación).
- Actualizar `handoff-figma-a-frontend.md` y `guion-validacion-piloto-ui.md` en siguiente iteración de cierre piloto.

---

## 7. Navegación — orden acordado y evolución post-MVP

### 7.1 Orden piloto (confirmado)

```text
Config → Plano → Invitados → Mesas → Afinidades → Distribución
```

**Rationale:**

| Tramo | Por qué este orden |
|-------|-------------------|
| Config → Plano | El organizador suele conocer el salón y el volumen aproximado antes de tener la lista cerrada; el hint de m² usa invitados aproximados de Config. |
| Plano → Invitados | El espacio queda dimensionado antes de cargar personas; la lista real se contrasta después con la capacidad de mesas. |
| Invitados → Mesas | La capacidad física (plazas) se valida contra invitados reales. |
| Mesas → Afinidades | En piloto, afinidades es borrador/mock; mesas es operativo — conviene cerrar capacidad antes de reglas sociales. |
| Afinidades → Distribución | El motor consume invitados, mesas y (futuro) restricciones. |

### 7.2 Principio UX transversal

- La **nav lateral** refleja el orden recomendado, pero **no bloquea** saltos entre pasos.
- El **dashboard** y el checklist indican el siguiente paso sugerido; no actúan como cárcel lineal.

### 7.3 Evolución post-MVP — posible inversión Mesas ↔ Afinidades

Cuando las **reglas genéricas y afinidades por persona** alimenten el motor y la planificación de mesas (p. ej. «mesa de solteros», «mantener familias unidas»), valorar este orden:

```text
Config → Plano → Invitados → Afinidades → Mesas → Distribución
```

**Condición para el cambio:** las reglas de afinidad deben **sugerir o preconfigurar** número, forma o capacidad de mesas (no solo ponderar el algoritmo de asignación).

**Mientras tanto (piloto y MVP temprano):** mantener **Mesas → Afinidades**.

**Puente UX (sin reordenar nav):** en la pantalla Mesas, mostrar avisos si reglas de afinidad guardadas implican ajustes de capacidad o distribución de mesas.

---

## 8. Diseño responsive y futuro modo colaborativo (móvil)

### 8.1 Principio

La aplicación es **web responsive**. El modo **colaborativo** implica que los invitados interactuarán desde **móvil** en la mayoría de casos (enlace RSVP, afinidades, consulta de mesa). El diseño debe anticiparlo **desde el piloto**, aunque el portal invitado no esté operativo.

**ADR:** `docs/adr/ADR-019-responsive-y-mobile-invitado.md`

### 8.2 Superficies

| Superficie | Prioridad viewport | Piloto |
|------------|-------------------|--------|
| Admin organizador | Desktop-first; degradación tablet/móvil sin rotura | Grids/listas responsive; sidebar fija (deuda) |
| Portal invitado (futuro) | **Mobile-first** (390 px base) | UI mock RSVP en admin reutilizable |
| Marketing | Dual desktop/móvil | ✅ |

### 8.3 Requisitos de diseño (enmienda)

- **RF-P05.1** Componentes de interacción invitado (RSVP, toggles afinidad, botones primarios) con área táctil ≥ 44 px.
- **RF-P05.2** Tablas admin: patrón lista/cards en viewport `< md`.
- **RF-P05.3** Formularios: columna única en móvil; sin acciones solo-hover.
- **RF-P05.4** Primitivos RSVP/estado en `components/ui/` para reutilizar en portal invitado.
- **RF-P05.5** Figma post-piloto: frames **390 × 844** para flujos invitado (RSVP + afinidades colaborativas).

### 8.4 Criterio de aceptación (piloto)

- Lista de invitados y distribución usables en 390 px de ancho (scroll horizontal solo donde sea inevitable, p. ej. plano).
- Iconos RSVP y botón «Añadir invitado» cumplen tamaño táctil mínimo.
