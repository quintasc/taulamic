# Especificación UX — Panel Invitados v2 y separación datos / reglas

- **Estado:** Propuesta PO (validación manual piloto, jun 2026)
- **Fecha:** 2026-06-21
- **Origen:** Sesión validación — `docs/agile/evidencias-piloto/sesion-2026-06-21.md`
- **Relacionado:** `ADR-018`, `handoff-figma-a-frontend.md`, `SDD-01-borrador-mvp.md` (HU-02, HU-03, HU-10–11, HU-15)
- **Alcance implementación:** **Post-piloto** (piloto julio mantiene lista simplificada actual)

---

## 1. Resumen ejecutivo

Tras validación del piloto, el PO confirma la **separación estricta** entre:

| Pestaña (nav piloto) | Rol conceptual | Contenido |
|----------------------|----------------|-----------|
| **Invitados** | Base de datos logística | Contacto, RSVP, categorías, necesidades físicas |
| **Afinidades** *(antes «Preferencias»)* | Motor de reglas | Reglas globales de agrupación, afinidades/incompatibilidades interpersonales |

La pantalla **Invitados** se rediseña como panel de control logístico de alta velocidad (estilo Strict Low-Fi admin), con **drawer lateral** para detalle y **barra de acciones masivas** contextual.

---

## 2. Configuración del evento — ubicación (Google Maps)

### RF-CONFIG-LOC-01

- **RF-CONFIG-LOC-01.1** Campo **ubicación** con integración **Google Maps** (autocompletado o selector de pin).
- **RF-CONFIG-LOC-01.2** Persistir coordenadas + dirección legible para reutilizar en invitaciones por correo (HU-10).
- **RF-CONFIG-LOC-01.3** Piloto actual: campo texto libre `location` en meta local; Maps es **post-piloto**.

---

## 3. Invitados — tabla principal

### 3.1 Objetivo

Vista por defecto **limpia y escaneable** para lectura rápida; sin formularios inline que ensucien la tabla.

### 3.2 Columnas (orden fijo)

| # | Columna | Contenido |
|---|---------|-----------|
| 1 | `[ ]` | Checkbox selección (activa barra masiva) |
| 2 | **RSVP** | Icono estado: confirmado / rechazado / pendiente |
| 3 | **Nombre** | Nombre completo |
| 4 | **Correo** | Email |
| 5 | **Teléfono** | Teléfono |
| 6 | **Categoría** | Categoría principal (ej. Familia, Amigos) |
| 7 | **Alertas** | Iconos compactos: 🌾 intolerancia / menú especial · ♿ movilidad |
| 8 | **Invitación** | Estado envío (no enviada / enviada / rebotada) |
| 9 | **⋮** | Acciones individuales (editar, eliminar, enviar invitación, …) |

### 3.3 Acciones de cabecera

| Control | Posición | Comportamiento piloto / MVP |
|---------|----------|----------------------------|
| **+ Añadir invitado** | Arriba derecha, botón primario coral | Abre drawer lateral |
| **Descargar plantilla Excel** | Secundario | Ya en piloto |
| **Importar Excel** | Secundario | Ya en piloto |
| **Exportar lista** | Secundario | Post-piloto (barra masiva o menú) |

### 3.4 Filtros rápidos (sobre la tabla)

- **Buscador** de texto (nombre, correo, teléfono).
- **Chips / botones** de filtro rápido, ej.:
  - «Solo menú especial»
  - «Pendientes de confirmar»
  - «Sin categoría»
  - «Invitación no enviada»

---

## 4. Drawer lateral — alta y edición

### RF-GUEST-DRAWER-01

- **RF-GUEST-DRAWER-01.1** Al pulsar **+ Añadir invitado** o **Editar** (⋮), se abre **panel lateral derecho** (drawer); la tabla permanece visible detrás.
- **RF-GUEST-DRAWER-01.2** Campos **en tabla** (solo lectura rápida): RSVP, nombre, correo, teléfono, categoría, alertas resumidas.
- **RF-GUEST-DRAWER-01.3** Campos **solo en drawer** (detalle profundo):
  - Acompañantes / pareja (`companionGroupId`)
  - Intolerancias y restricciones alimentarias
  - Necesidades de movilidad / accesibilidad
  - Notas internas del organizador
  - Historial RSVP (post-MVP)
- **RF-GUEST-DRAWER-01.4** Guardar / Cancelar en pie del drawer; cierre sin perder contexto de la lista.

> **Regla de oro:** nada que alimente el **motor de reglas de seating** (afinidades ±, reglas globales) se edita aquí; eso vive en **Afinidades**.

---

## 5. Barra de acción contextual (acciones masivas)

### RF-GUEST-BULK-01

- **RF-GUEST-BULK-01.1** Al marcar ≥ 1 checkbox, aparece **barra flotante** (parte inferior o sustituyendo cabecera de tabla).
- **RF-GUEST-BULK-01.2** Texto: «**N** invitados seleccionados» + acciones secundarias.
- **RF-GUEST-BULK-01.3** Acciones masivas:

| Acción | Descripción | Piloto |
|--------|-------------|--------|
| **Asignar categoría** | Mover N invitados a categoría | Post-piloto |
| **Cambiar estado RSVP** | Marcar confirmados / pendientes en bloque | Mock → real post-piloto |
| **Enviar invitaciones** | Disparo masivo email (HU-10) | Post-MVP |
| **Exportar selección** | Excel/CSV de filas seleccionadas | Post-piloto |
| **Eliminar** | Borrado con diálogo de confirmación | API existe; UI masiva post-piloto |

- **RF-GUEST-BULK-01.4** «Seleccionar todos» (checkbox cabecera) respeta filtros activos.
- **RF-GUEST-BULK-01.5** Deseleccionar cierra la barra.

### Acciones ya contempladas (añadir a barra o menú overflow)

- Descargar plantilla Excel
- Importar Excel
- Exportar lista completa
- Enviar recordatorio RSVP (HU-11)

---

## 6. Afinidades — solo motor de reglas

Sin cambio de alcance respecto a **ADR-018**:

- Reglas globales (agrupar por categoría, familias unidas, mesa solteros, …).
- Afinidades (+) e incompatibilidades (−) **entre personas**.
- **No** incluir: correo, teléfono, RSVP, intolerancias (pertenecen a Invitados).

---

## 7. Matriz piloto julio vs esta especificación

| Capacidad | Piloto jul 2026 | Panel v2 (esta spec) |
|-----------|-----------------|----------------------|
| Tabla columnas completas | Parcial | ✅ Objetivo |
| Drawer lateral | No (form inline/modal) | ✅ |
| Bulk action bar | No | ✅ |
| Filtros rápidos | Búsqueda básica | ✅ Chips |
| Google Maps ubicación | Texto libre | ✅ Integración |
| Iconos alertas 🌾/♿ | Parcial / API | ✅ Columna dedicada |

---

## 8. Entregables Figma (Ventana 2)

1. Frame **Invitados — tabla vacía** con columnas y filtros.
2. Frame **Invitados — drawer abierto** (alta / edición).
3. Frame **Invitados — barra masiva** (N seleccionados).
4. Frame **Invitados — filtros activos**.
5. Anotación de separación vs pantalla **Afinidades**.

---

## 9. Criterios de aceptación (post-piloto)

1. Organizador añade invitado sin perder vista de la tabla (drawer).
2. Selección múltiple muestra barra con contador correcto.
3. «Asignar categoría» en bloque actualiza N filas sin recargar página.
4. Columna Alertas refleja intolerancia/movilidad sin abrir drawer.
5. Ningún control de afinidad ± aparece en pantalla Invitados.
6. Ubicación con Maps disponible en config y reutilizable en plantilla de invitación (cuando HU-10 exista).
