# Taulamic — Contexto para Figma Make (MVP Piloto Julio)

> **Uso:** documento único para alimentar la conversación con **Figma Make** (enlace GitHub).
> No sustituye el handoff a desarrollo (`handoff-figma-a-frontend.md`).
>
> **Última actualización:** 2026-06-22

---

## Visión general

Taulamic es una aplicación web para organizadores de bodas y eventos. Facilita la logística mediante importación de invitados (Excel), configuración de mesas y cálculo automático de distribución de asientos según reglas de afinidad y acompañantes.

**Piloto julio:** sin login; acceso directo a `/admin`; evento nuevo por sesión.

---

## 1. Sistema de diseño

Tipografía **Inter**, grid base **8px**. Dos entornos visuales distintos:

| Entorno | Estilo | Color | Componentes |
| --- | --- | --- | --- |
| **Marketing** | Pulido, ilustraciones, sombras suaves | Paleta completa, logos | Componentes estándar |
| **Admin** | Wireframe low-fi, compacto, sin ilustraciones | Escala de grises + coral solo CTA/activo | `WfCard`, `WfBtn`, `WfLabel`, `wfInput` |

### Paleta

- **Primarios (marketing, CTA, activo):** `#E86B4A` / `#D45A3A` / `#FDECE8`
- **Grises admin:** `#F9F9F9` / `#F0F0F0` / `#E0E0E0` / `#C4C4C4` / `#A0A0A0`
- **Neutros:** `#1A1A1A` / `#4A4A4A` / `#8A8A8A` / `#E8E8E8` / `#F5F5F5` / `#FFFFFF`
- **Semánticos:** Info `#3B82F6` | Success `#22A06B` | Warning `#E5A100` | Error `#D14343`

Detalle tokens: ver `design-tokens-mvp.md` en el mismo directorio del repo.

---

## 2. Arquitectura Figma (3 páginas)

### Página 1 — Sistema (UI Kit)

Portada 800×400, librería con Auto Layout y variantes (Default, Hover, Disabled, Error): botones, inputs, chips de estado, tarjetas, filas tabla, alertas, spinners, empty states.

### Página 2 — Marketing

Landing 1440×900 (desktop) y 390×844 (mobile). Header, hero «Afinidad inteligente para tus mesas», tarjetas Bodas / Aulas / Empresa.

### Página 3 — Admin

Desktop 1280×800. Sidebar ~220px (logo, evento en curso solo lectura, nav) + área principal.

**Nav admin:** Dashboard · Configuración · Plano · Invitados · Preferencias · Mesas · Distribución · Mapa navegación (pie sidebar).

---

## 3. Módulos Admin

### Dashboard y configuración

- **Configuración:** nombre, fecha, lugar, nº mesas (meta UI), notas, Guardar.
- **Dashboard (v2):** KPIs Invitados, Mesas, Afinidad, Setup + checklist + accesos rápidos.

### Invitados (Excel)

- Plantilla `.xlsx` → drag & drop → importar.
- Errores: tabla `Fila | Columna | Error | Acción`; Reintentar / Continuar con válidos.
- **Plantilla sin columna `preferencia_control`** (modo colaborativo/exclusivo es del evento, pantalla Preferencias).

### Preferencias y mesas

- **Preferencias:** radio Colaborativo vs Anfitrión exclusivo + Guardar.
- **Mesas:** forma (Redonda, Rectangular, Ovalada), capacidad, preview asientos numerados, listado mesas creadas.

### Plano (visión actualizada — post-MVP visual completo)

**No** usar el plano para detectar mesas por IA en salones grandes.

1. **Upload:** subir PDF/PNG/JPG como **fondo espacial** del salón.
2. **Canvas (tras calcular distribución):** perímetro del salón, pista, escenario, entradas, bar (discontinuo).
3. **Mesas** como formas geométricas **arrastrables** sobre el canvas.
4. **Estados de mesa en canvas:** verde Llena, ámbar En uso, gris Vacía; etiqueta + ocupación (8/8).
5. **Panel lateral:** resumen ocupación, mesa seleccionada (afinidad, invitados), Restablecer / Guardar posiciones.

*Piloto código julio: solo upload mínimo; canvas drag-drop es diseño objetivo post-MVP.*

### Distribución (v2 — diseño objetivo)

Estados: vacío · calculando · listo.

**KPIs:** Afinidad media · Total invitados · Sin asignar · **Plazas libres**.

**Afinidad en piloto:** mostrar **«No calculado en piloto»** (no presentar % como dato real).

**Filtros:** Todas · Llenas · En uso · Vacías (+ contadores) · Buscar mesa… · total «N mesas».

**Tabla de mesas** (todas las configuradas, también vacías):

| MESA | FORMA | CAPACIDAD | AFINIDAD |
|------|-------|-----------|----------|
| M1 + chip Llena / En uso · X libre / Vacía | Redonda… | barra 8/8 | 91%* |

\* estimación visual piloto hasta API real.

**Fila expandida:** pills con nombres de invitados; chevron ▾/▸.

**Edición manual (post-piloto):** ✕ en pill quitar de mesa; + en mesa añadir sin asignar.

**Clic en «Sin asignar»** (dashboard o distribución): panel/lista invitados no asignados (diseño pendiente).

**Pie:** Confirmar distribución para el evento · nota Top-K post-piloto.

**Motor v1:** priorizar ocupabilidad de mesas (no reparto equitativo obligatorio).

---

## 4. Decisiones UX — validación manual (jun 2026)

Resumen para no depender del chat:

| Tema | Decisión |
|------|----------|
| Distribución lista | Tabla + filtros; **todas** las mesas (vacías visibles) |
| Dashboard Invitados | Subtexto por caso; barra % asignación con color |
| Dashboard Mesas | Solo nº mesas API + plazas totales; subtexto sobran/faltan plazas vs invitados |
| Afinidad % | «No calculado en piloto» |
| Excel | Sin `preferencia_control` por fila |
| Plano | Espacial post-distribución, drag-drop — **fuera MVP código** |
| Bloquear invitados | SDD prevé bloqueos admin; UI/API post-piloto |
| Checklist setup | Conectar preferencias/plano a API (hoy parcial) |

---

## 5. Referencias en el repo (no pegar en Make si usas solo este doc)

| Documento | Para quién |
|-----------|------------|
| `figma-make-prompts.md` | Prompts incrementales Make |
| `handoff-figma-a-frontend.md` | Implementación Next.js + API |
| `design-tokens-mvp.md` | Tokens CSS |
| `figma-mvp.md` | Índice issue #7 y URL archivo Make |

---

## 6. Assets

Logos en `docs/ux/assets/`: `taulamic-logo.png`, `taulamic-icon-bodas.png`.
