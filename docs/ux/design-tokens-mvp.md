# Design tokens MVP — Taulamic

- Estado: **Vigente** (tokens visuales del piloto)
- Guía canónica UX/UI: **`guia-estilo-taulamic.md`** (patrones de interacción + esta paleta)
- Referencias SDD: `SDD-01C-principios-estilo-y-baja-friccion.md`, `SDD-01A-figma-ui-ux.md`
- Origen visual: propuesta landing «Afinidad Inteligente» (jun 2026)

Este documento fija **tokens visuales** (color, tipo, espaciado). Los patrones de comportamiento (setup, feedback, navegación) viven en `guia-estilo-taulamic.md`.

---

## 1) Dos modos de interfaz

| Aspecto | Marketing (landing) | App admin (producto) |
|---------|---------------------|----------------------|
| Objetivo | Marca, conversión, contexto | Tareas operativas (plano, Excel, distribución) |
| Decoración | Ilustraciones planas, hero amplio | Mínima; datos y acciones primero |
| Logo | Isotipo completo (red + wordmark) | Isotipo simplificado o wordmark compacto |
| Densidad | Espaciado generoso | Más compacto; tablas y formularios |
| Color acento | Coral visible en titulares y CTA | Coral solo en primarios, links y estados activos |
| Tipografía | H1 expresivo | Jerarquía funcional (títulos de pantalla, labels) |

**Regla:** misma paleta y tipografía en ambos modos; cambia cantidad de ornamentación y densidad.

---

## 2) Color

### Marca

| Token | Hex (propuesta) | Uso |
|-------|-----------------|-----|
| `color-primary-500` | `#E86B4A` | Logo, CTA primario, acentos de marca |
| `color-primary-600` | `#D45A3A` | Hover CTA, estados activos |
| `color-primary-100` | `#FDECE8` | Fondos suaves, badges de marca |

### Neutros

| Token | Hex (propuesta) | Uso |
|-------|-----------------|-----|
| `color-neutral-900` | `#1A1A1A` | Texto principal, titulares app |
| `color-neutral-700` | `#4A4A4A` | Texto secundario |
| `color-neutral-500` | `#8A8A8A` | Placeholders, hints |
| `color-neutral-200` | `#E8E8E8` | Bordes, divisores |
| `color-neutral-100` | `#F5F5F5` | Fondos alternos, filas tabla |
| `color-neutral-0` | `#FFFFFF` | Fondos base, tarjetas |

### Semánticos (SDD-01B / SDD-01C)

| Token | Hex (propuesta) | Uso |
|-------|-----------------|-----|
| `color-info-500` | `#3B82F6` | Información, ayuda |
| `color-success-500` | `#22A06B` | Éxito, estable, «mejor» en comparador |
| `color-warning-500` | `#E5A100` | Atención, pendiente |
| `color-error-500` | `#D14343` | Error, peor relativo en comparador |

**Accesibilidad:** texto sobre blanco usar `neutral-900` o `neutral-700`. Reservar `primary-500` para acentos y botones con texto blanco (`#FFFFFF`). No depender solo del color: acompañar con icono o texto (SDD-01B).

### Acentos ilustración (logo / marketing)

Teal `#5BA3A8`, amarillo `#E8C547`, azul `#6B9FD4` — solo en ilustraciones e isotipo; no en UI funcional salvo gráficos decorativos.

---

## 3) Tipografía

| Token | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| `text-display` | 40–48 px | 700 | Hero landing («Afinidad Inteligente») |
| `text-h1` | 28–32 px | 700 | Título de pantalla admin |
| `text-h2` | 22–24 px | 600 | Secciones |
| `text-h3` | 18 px | 600 | Subsecciones, títulos tarjeta |
| `text-body` | 16 px | 400 | Cuerpo, formularios |
| `text-body-sm` | 14 px | 400 | Tablas, metadatos |
| `text-caption` | 12 px | 500 | Labels, chips, overline nav |
| `text-button` | 14–16 px | 600 | Botones |

**Familia (propuesta):** una sans moderna legible — Inter, DM Sans o Plus Jakarta Sans. Wordmark «taulamic» puede usar variante redondeada en logo; UI usa la misma familia en pesos estándar.

**Line-height:** 1.5 cuerpo; 1.2–1.3 titulares.

---

## 4) Espaciado y forma

| Token | Valor | Uso |
|-------|-------|-----|
| `space-1` | 4 px | Ajustes finos |
| `space-2` | 8 px | Padding interno chips |
| `space-3` | 12 px | Gap entre elementos relacionados |
| `space-4` | 16 px | Padding tarjetas, inputs |
| `space-6` | 24 px | Separación secciones |
| `space-8` | 32 px | Márgenes bloque |
| `space-12` | 48 px | Hero, separación mayor marketing |
| `radius-sm` | 8 px | Inputs, chips |
| `radius-md` | 12 px | Botones |
| `radius-lg` | 16 px | Tarjetas landing |
| `shadow-card` | `0 2px 8px rgba(26,26,26,0.08)` | Tarjetas marketing |
| `shadow-none` | — | App admin (preferir borde `neutral-200`) |

---

## 5) Componentes base (checklist Figma / código)

Marcar cuando existan variantes **default / hover / disabled / loading / error / empty** en Figma y primitivo en `components/ui/`.

- [x] Botón primario (coral, texto blanco) — `.btn-primary`
- [x] Botón secundario (borde, fondo blanco) — `.btn-secondary`
- [ ] Botón texto / link (patrón inline; links `text-primary-600`)
- [x] Input texto, textarea — `.input-field`
- [ ] Select nativo estilizado
- [x] Toggle / selección (modo preferencias, reglas afinidades)
- [ ] Chip de estado dedicado (usar `Alert` / badges inline)
- [x] Tarjeta admin — `.card-admin` · marketing — `.card-marketing`
- [x] Tabla / lista (filas, vacío; invitados v2, distribución)
- [x] Alert (feedback persistente)
- [x] Toast (feedback inmediato autodismiss) — `toast.tsx`
- [ ] Skeleton / spinner dedicado (carga con copy en pantalla)
- [x] Empty state — `EmptyState`
- [x] Indicador auto-guardado — `SaveStatusIndicator`
- [x] Cabecera de pantalla — `PageHeader` (+ slot `saveStatus`)
- [x] Navegación setup — `SetupNavBar`

---

## 6) Logo

| Recurso | Ruta |
|---------|------|
| **Isotipo PNG** (fondo transparente) | `docs/ux/assets/taulamic-logo.png` |
| **Icono Bodas** (copas + tarta, vertical piloto) | `docs/ux/assets/taulamic-icon-bodas.png` |

| Variante | Uso |
|----------|-----|
| **Completo** | Landing, email, presentaciones |
| **Simplificado** | Favicon, barra lateral admin, espacios &lt; 32 px |
| **Wordmark solo** | Header app cuando el isotipo no cabe |

El isotipo simplificado: círculo central coral + 2–3 nodos/líneas (sin red densa) para legibilidad a tamaño pequeño.

---

## 7) Landing — decisiones de contenido (MVP piloto)

- **CTA principal:** «Crear evento» o «Empezar» — visible bajo el subtítulo.
- **Nav:** añadir «Iniciar sesión»; «Precios» opcional hasta modelo cerrado.
- **Verticales:** bodas/celebraciones como foco piloto; aulas y empresa pueden ir como secundarias o «próximamente».
- **Titular sugerido (híbrido):** «Afinidad inteligente para tus mesas» + subtítulo actual.

---

## 8) Próximos pasos en Figma (plan 3 páginas)

1. Página **1 — Sistema**: variables + componentes base.
2. Página **2 — Marketing**: landing.
3. Página **3 — Admin**: secciones por flujo + enlaces prototipo.

---

## 9) Implementacion en codigo (web)

| Documento | Contenido |
|-----------|-----------|
| **`docs/ux/guia-estilo-taulamic.md`** | **Guía canónica UX/UI** (patrones obligatorios) |
| `docs/ux/frontend-component-system.md` | Mapa de carpetas, reglas de reutilizacion |
| `docs/adr/ADR-017-frontend-design-system-modular.md` | Decision arquitectura + theming futuro |
| `apps/web/src/theme/brand.config.ts` | Rutas PNG y nombre de producto |
| `apps/web/src/app/globals.css` | Variables CSS y clases `.btn-*`, `.card-*` |

**Piloto julio:** tokens fijos. **MVP completo:** paquetes de tema (colores, tipografia, assets) intercambiables sin reescribir pantallas.

URL Figma: `figma-mvp.md`.
