# Prompts Figma Make — completar MVP piloto (#7)

Archivo: [MVP Taulamic App Design](https://www.figma.com/make/SanoIvjqWYghT7bXfNVpxj/MVP-Taulamic-App-Design?t=95kTMsKGpTjDmpBI-1)

**Cómo usar:** pega **un prompt por mensaje** en Figma Make. Espera el resultado, revisa, ajusta. Repite en el orden indicado.

**Contexto visual existente (no cambiar):** 3 pestañas Marketing · Admin · Sistema. Coral `#EB6B4A`, fuente Inter, sidebar admin con evento «Boda García-López», nav Dashboard / Configuración / Plano / Invitados / Preferencias / Mesas / Distribución.

---

## Orden de ejecución

| # | Prompt | Prioridad | Página |
|---|--------|-----------|--------|
| 1 | Nota piloto auth (CTAs) | Alta | Marketing |
| 2 | Plano del salón (Fase A) | Alta | Admin |
| 3 | Errores Excel | Alta | Admin |
| 4 | Distribución calculada | Media | Admin |
| 5 | Mapa navegación | Media | Admin |
| 6 | Enlaces prototipo | Media | Admin |
| 7 | Unificar color token | Baja | Sistema |

---

## Prompt 0 — Contexto (opcional, pegar antes del 1 si Make «olvida» el estilo)

```text
Proyecto Taulamic MVP piloto julio. App web para organizadores de eventos (bodas). Mantén el diseño existente: Inter, coral #EB6B4A, sidebar admin 220px, fondo blanco, bordes grises #E8E8E8 en admin. Textos en español (España). Mismo layout que pantallas Admin ya creadas (Dashboard, Subir plano, Importar invitados).
```

---

## Prompt 1 — Marketing: nota piloto auth (Opción A)

**Qué hace:** documenta que no habrá registro/login en el piloto; los CTAs siguen visibles.

```text
En la página Marketing, junto al botón "Crear evento" y cerca de "Iniciar sesión", añade una nota discreta (sticky note amarilla o texto caption gris #8A8A8A, 12px):

"Piloto julio: acceso directo al panel organizador (admin único). Registro y auth completo — post-julio 2026."

NO crear pantallas de registro, login ni recuperar contraseña. Mantener CTAs "Iniciar sesión", "Crear evento" y "Empezar gratis" como están. Solo añadir la nota explicativa.
```

---

## Prompt 2 — Admin: Plano del salón — Fase A (`ADR-016`, `SDD-01D`)

**Flujo vigente:** Configurar forma y medidas → Guardar y continuar → Mesas / Invitados.

> **Suspendido:** pantalla «Corregir plano» (detección de mesas). Ver `ADR-016`.

```text
Pantalla Admin "Plano del salón", sidebar Plano activo.

Título: "Plano del salón"
Subtítulo: "Define la forma y el tamaño del espacio."

Layout:
- Canvas central: forma del salón (rectangular / redonda / ovalada) con tirador de redimensionar; medidas sincronizadas en metros.
- Sidebar derecha plegable "Configuración del salón": pills Forma, inputs Ancho/Largo o Radio (m).
- Bloque "Accesorios": tarjetas Mesa novios, Pista baile, etc. (marcar en lista; arrastre al canvas post-piloto).
- Bloque "Fondo inteligente" (opcional post-piloto): subir JPG/PNG/PDF como capa visual — IA detecta contorno del espacio, NO mesas.
- Botón primario coral header: "Guardar y continuar"

NO incluir lista "Mesas detectadas" ni chips de confianza de detección. Estilo Taulamic, Inter, coral #EB6B4A.
```

---

## Prompt 3 — Admin: Errores importación Excel (FALTA — SDD-01E)

**Flujo:** Importar invitados → **esta pantalla** (si hay errores) → Dashboard.

```text
Nueva pantalla Admin "Errores de importación", sidebar Invitados activo.

Título: "Errores en el Excel"
Subtítulo: "Corrige las filas indicadas y vuelve a importar."

Alert error (componente rojo existente): "13 filas con errores — 487 invitados válidos de 500"

Tabla ancho completo, columnas: FILA | COLUMNA | CAMPO | ERROR | ACCIÓN
Filas ejemplo:
- 12 | D | email | "Formato de email inválido" | link coral "Corregir"
- 45 | B | nombre | "Campo obligatorio vacío" | "Corregir"  
- 78 | F | mesa | "Número de mesa no existe" | "Corregir"
Una fila con fondo rojo muy suave (#D14343 al 10%).

Abajo: botón secundario "Descargar filas con error" y botón primario coral "Continuar con 487 invitados válidos" (habilitado). Botón texto "Reintentar importación".

Mismo estilo Taulamic Admin existente.
```

---

## Prompt 4 — Admin: Distribución calculada (complementa empty state)

**Flujo:** Distribución vacía → Calcular → **esta vista**.

```text
En Admin pantalla "Distribución", crea variante ESTADO CALCULADO (mantén también el empty state actual).

Mismo header: título "Distribución", subtítulo "Asigna invitados a las mesas por afinidad", botón "Recalcular distribución" (secundario) arriba derecha.

Debajo: 4 mini KPIs en fila: "Afinidad media 82%" verde | "84 invitados" | "12 mesas" | "0 sin asignar"

Lista acordeón de mesas (3 visibles):
- Mesa 1 — Redonda — 8/8 pax — chip "Afinidad 91%"
  Lista nombres: Ana García, Carlos Ruiz, …
- Mesa 2 — Redonda — 7/8 pax — chip "Afinidad 78%"
- Mesa 3 — Rectangular — 8/8 pax — chip "Afinidad 85%"

Botón primario coral footer: "Confirmar distribución para el evento"
Nota caption: "Comparador Top-K — disponible post-piloto"

Estilo consistente con Dashboard Taulamic.
```

---

## Prompt 5 — Admin: Mapa de navegación

**Enlace desde sidebar «Mapa navegación».**

```text
Nueva pantalla o sección Admin "Mapa de navegación", fondo #F5F5F5, diagrama de flujo horizontal con cajas y flechas, estilo limpio:

[Marketing landing] → [Acceso directo piloto] → [Dashboard evento]
Desde Dashboard ramas:
→ Configuración evento ✓
→ Plano del salón (forma + medidas) ✓ → Mesas ✓ → … → Distribución → Ver en plano (Fase B) ✓
~~→ Subir plano → Corregir plano → Confirmar~~ (legacy — suspendido)
→ Importar Excel → Errores fila (si aplica) ✓
→ Preferencias modo ✓
→ Configurar mesas ✓
→ Calcular distribución → Confirmar ✓

Etiquetas naranja "PILOTO JUL" en flujos marcados ✓.
Rama gris punteada "POST-PILOTO": Registro/Login, RSVP invitado, Top-K comparador.

Texto nota: "Auth: acceso directo en piloto (sin registro)."
Coral #EB6B4A para cajas activas piloto.
```

---

## Prompt 6 — Prototipo: enlazar flujos

```text
Conecta en modo prototipo (misma app Taulamic):

Marketing "Crear evento" → Admin Dashboard (acceso directo piloto, sin login).
Marketing "Iniciar sesión" → Admin Dashboard (mismo, piloto).

Admin:
- Plano "Guardar y continuar" → Invitados o Mesas (piloto)
- ~~Subir plano → Corregir plano → Confirmar~~ (legacy suspendido)
- Importar invitados "Importar" (con errores simulados) → Errores Excel → "Continuar con válidos" → Dashboard
- Importar invitados éxito → Dashboard directo
- Configuración "Guardar" → Dashboard
- Distribución "Calcular distribución" → vista calculada → "Confirmar distribución" → Dashboard

Device desktop. Transición dissolve.
```

---

## Prompt 7 — Sistema: unificar token color (opcional)

```text
En página Sistema, unifica el color primario de marca a #E86B4A en toda la documentación de tokens (si aparece #EB6B4A, cámbialo). Actualiza muestras de botón primario y chips para usar #E86B4A consistentemente. No cambies layouts de Marketing ni Admin.
```

---

## Checklist al terminar

- [x] Prompt 1 — Nota auth en Marketing
- [x] Prompt 2 — Plano del salón Fase A (sustituye «Corregir plano» — `ADR-016`)
- [x] Prompt 3 — Errores Excel
- [x] Prompt 4 — Distribución calculada
- [x] Prompt 5 — Mapa navegación
- [x] Prompt 6 — Enlaces prototipo
- [x] Prompt 7 — Color unificado (opcional)
- [ ] Exportar PDF capturas → evidencia en repo (opcional)
- [ ] Cerrar issue #7 cuando verificado + merge

## Lo que NO hacer (piloto julio)

- Registro / login / recuperar contraseña
- RSVP invitado
- Comparador Top-K
- Pantallas invitado o salón/cocina

Ver `figma-mvp.md` sección «Acceso y alta de usuario».
