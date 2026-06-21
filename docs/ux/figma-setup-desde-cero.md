# Figma — empezar de cero (issue #7)

Guía para crear el archivo Figma MVP de Taulamic. Tiempo estimado sesión 1: **2–3 h**.

Referencias: `design-tokens-mvp.md`, `figma-mvp.md`, `SDD-01A-figma-ui-ux.md`.

---

## Sesión 1 — orden recomendado

| Paso | Qué hacer | Tiempo |
|------|-----------|--------|
| 1 | Crear archivo y estructura de páginas | 15 min |
| 2 | Variables de color y texto | 30 min |
| 3 | Landing marketing (recuperar propuesta) | 45 min |
| 4 | Componentes base mínimos | 45 min |
| 5 | Mapa de navegación admin | 30 min |
| 6 | Primer wireframe admin (evento) | 30 min |
| 7 | Pegar URL en `figma-mvp.md` | 5 min |

---

## Paso 1 — Crear el archivo

1. Abre [figma.com](https://www.figma.com) → **New design file**.
2. Renombra el archivo: **`Taulamic — MVP piloto julio`**.
3. (Opcional) Muévelo al team **Taulamic** si ya existe; si no, créalo.

### Páginas (Pages) — plan de 3 páginas (plan prueba / Starter)

El límite de **3 páginas por archivo** en el plan gratuito/prueba **no impide** completar el MVP. Lo que antes repartíamos en 7 páginas va en **3 páginas + secciones** dentro de cada una.

Renombra las 3 páginas así:

```
1 — Sistema
2 — Marketing
3 — Admin
```

| Página | Contiene (como secciones Figma) |
|--------|----------------------------------|
| **1 — Sistema** | Cover mini, componentes UI, nota de tokens |
| **2 — Marketing** | Landing desktop (+ mobile más adelante) |
| **3 — Admin** | Mapa navegación + todos los wireframes + enlaces de prototipo |

**Cómo organizar:** selecciona frames relacionados → clic derecho → **Add section** (o atajo `Shift+S`). Nombra la sección (ej. `Wireframes / Excel`).

Lo que **no** necesitas en plan 3 páginas:

- Página aparte de prototipo → los enlaces Prototype viven en la misma página **Admin**
- Página Archive → borra o mueve frames viejos al final de **Admin** en sección `_archive`
- Página Design tokens → las **variables** van en el panel Local variables (no ocupan página)

> Si más adelante subes de plan, puedes dividir: Sistema → tokens + components; Admin → flows + prototype.

**Convención de frames:** `Flujo / Pantalla / Variante`  
Ejemplo: `Excel / Errores por fila / Desktop`.

---

## Paso 2 — Variables (design tokens)

En Figma: panel **Local variables** → colección **`Taulamic MVP`**.

### Colores (mode: Default)

Copiar hex desde `design-tokens-mvp.md`:

| Variable | Hex |
|----------|-----|
| primary/500 | #E86B4A |
| primary/600 | #D45A3A |
| primary/100 | #FDECE8 |
| neutral/900 | #1A1A1A |
| neutral/700 | #4A4A4A |
| neutral/500 | #8A8A8A |
| neutral/200 | #E8E8E8 |
| neutral/100 | #F5F5F5 |
| neutral/0 | #FFFFFF |
| semantic/info | #3B82F6 |
| semantic/success | #22A06B |
| semantic/warning | #E5A100 |
| semantic/error | #D14343 |

### Tipografía

Instala **Inter** (Google Fonts) o usa la fuente del sistema.

Crea **text styles** (no hace falta variable numérica al inicio):

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Display | Inter | 48 | Bold |
| H1 | Inter | 32 | Bold |
| H2 | Inter | 24 | SemiBold |
| H3 | Inter | 18 | SemiBold |
| Body | Inter | 16 | Regular |
| Body sm | Inter | 14 | Regular |
| Caption | Inter | 12 | Medium |
| Button | Inter | 16 | SemiBold |

### Espaciado (opcional sesión 1)

Grid **8 px** en frames admin. Padding estándar: 16 / 24 / 32.

---

## Paso 3 — Página `1 — Sistema`

### Sección `Cover` (opcional, frame pequeño 800×400)

- Logo / wordmark «taulamic»
- Título: **MVP piloto julio — UX/UI**
- Enlace al repo: `docs/ux/figma-mvp.md`

### Sección `Components`

Ver Paso 5 (componentes base). Mantener componentes **solo en esta página** para no duplicar instancias.

### Tokens

Configurar en **Local variables** (Paso 2). No hace falta dibujar paleta salvo que quieras una referencia visual junto al Cover.

---

## Paso 4 — Página `2 — Marketing`

Frame **Desktop 1440 × 900** — **Landing v1** (sección `Landing`).

### Bloques (de arriba a abajo)

1. **Header:** logo | SOBRE NOSOTROS · PRECIOS · BLOG · Iniciar sesión
2. **Hero:** H1 + subtítulo + CTA primario «Crear evento»
3. **3 tarjetas:** Bodas (destacada) · Aulas · Empresa
4. (Opcional) Footer mínimo

Si tienes la imagen de referencia «Afinidad Inteligente», impórtala como imagen de fondo o guía (bloquear capa, opacidad 30 %) y redibuja encima con componentes.

**Ajustes respecto al borrador:**

- Añadir CTA coral bajo el subtítulo
- Añadir «Iniciar sesión» en nav
- H1 sugerido: *Afinidad inteligente para tus mesas*

Duplica frame a **Mobile 390 × 844** cuando desktop esté listo.

---

## Paso 5 — Componentes (en página `1 — Sistema`, sección `Components`)

Crear como **components** con variantes `State=Default|Hover|Disabled|Loading|Error`.

Mínimo para desbloquear wireframes admin:

1. **Button / Primary** — fondo primary/500, texto blanco, radius 12
2. **Button / Secondary** — borde neutral/200
3. **Input / Text** — label + campo + hint/error
4. **Chip / Status** — info | success | warning | error
5. **Card / Admin** — borde neutral/200, sin sombra
6. **Table row** — normal | error (fila Excel)

Usar **Auto layout** en todos.

---

## Paso 6 — Página `3 — Admin`

Organizar con **secciones** en vertical (scroll hacia abajo o disposición en grid amplio):

| Sección | Contenido |
|---------|-----------|
| `Mapa navegación` | Diagrama de flujos (Paso 6a) |
| `Evento` | Wireframes config / dashboard |
| `Plano` | Upload + corrección |
| `Excel` | Plantilla + errores |
| `Preferencias` | Modo colaborativo / exclusivo |
| `Mesa` | Forma + vista asientos |
| `Distribución` | Tablero borrador v0 |

### 6a) Mapa de navegación (primero)

Frame **2400 × 1600**, fondo neutral/100. Cajas conectadas con flechas:

```
[Login] → [Lista eventos] → [Dashboard evento]
                                ├→ Configuración evento
                                ├→ Importar plano → Corregir detecciones
                                ├→ Invitados → Plantilla Excel → Import → Errores fila
                                ├→ Modo preferencias
                                ├→ Forma mesa → Vista previa asientos
                                └→ Tablero distribución (borrador v0)
```

Marca con etiqueta **PILOTO JUL** los flujos obligatorios; **POST** el resto (RSVP, Top-K, invitado).

### 6b) Wireframes low-fi — piloto julio

Estilo wireframe: grises + primary solo en CTA. Sin ilustraciones.

| Frame | Contenido mínimo |
|-------|------------------|
| **Evento — Config** | Nombre, fecha, nº mesas, guardar |
| **Plano — Upload** | Zona drag-drop, barra progreso, botón «Subir PDF/imagen» |
| **Plano — Corrección** | Canvas plano + lista mesas detectadas + confianza + editar/eliminar |
| **Excel — Plantilla** | Descargar plantilla + subir archivo |
| **Excel — Errores** | Tabla fila | columna | error | acción corregir |
| **Preferencias — Modo** | Radio: colaborativo / anfitrión exclusivo + texto explicativo |
| **Mesa — Forma** | Selector forma + capacidad + preview asientos alrededor |
| **Distribución — Tablero** | Lista mesas + invitados asignados + botón «Calcular» (borrador) |

Tamaños: **Desktop 1280 × 800** (admin). Mobile post-piloto salvo RSVP.

Layout admin sugerido:

```
┌──────────┬─────────────────────────────┐
│ Sidebar  │  Título pantalla + acciones │
│ nav      │  ─────────────────────────  │
│          │  Contenido principal        │
└──────────┴─────────────────────────────┘
```

Sidebar: logo compacto, evento activo, enlaces a secciones del mapa.

---

## Paso 7 — Prototipo (misma página `3 — Admin`)

No hace falta página extra. Cuando existan 2+ pantallas de un flujo:

1. Selecciona frames del flujo (ej. Excel completo).
2. **Prototype** → conectar botones (Subir → Errores → Dashboard).
3. Device: **Desktop**, starting frame = primera pantalla.

Objetivo piloto: prototipo clicable de **import Excel** y **import plano**.  
Compartir con **Share → Copy link → Prototype** (como el enlace que ya tienes).

---

## Paso 8 — Cerrar sesión 1

1. **Share** → copiar enlace «Anyone with link can view» (o team).
2. Pegar URL en `figma-mvp.md` (tabla Archivo Figma).
3. Marcar `[x]` en checklist lo completado.
4. Commit en `feat/7-figma-mvp` (opcional).

---

## Sesiones siguientes

| Sesión | Objetivo |
|--------|----------|
| 2 | Completar wireframes piloto + estados vacío/error/carga |
| 3 | Prototipo clicable flujos plano + Excel |
| 4 | Refinar forma mesa (coordinar con #15 / OpenAPI) |
| 5 | Post-piloto: RSVP, Top-K, invitado |

---

## Checklist rápido sesión 1

- [ ] Archivo con **3 páginas**: Sistema · Marketing · Admin
- [ ] Secciones creadas en Admin (mapa + al menos 1 wireframe)
- [ ] Variables de color cargadas
- [ ] Text styles definidos
- [ ] Landing desktop en `2 — Marketing`
- [ ] 6 componentes base en `1 — Sistema`
- [ ] Mapa navegación en `3 — Admin`
- [ ] Wireframe «Evento — Config»
- [ ] URL documentada en `figma-mvp.md`

---

## Ayuda Figma (atajos útiles)

| Acción | Atajo (Win) |
|--------|-------------|
| Frame | F |
| Rectangle | R |
| Text | T |
| Component | Ctrl+Alt+K |
| Auto layout | Shift+A |
| Duplicate | Ctrl+D |
