# Backlog — mejoras futuras (ideas post-piloto)

> **Estado:** ideas registradas · **no** comprometidas en el piloto jul 2026  
> **Origen:** sesión PO jun 2026 (refactor UI móvil admin)

Estas mejoras **no forman parte del SDD piloto**. Requieren gate PO/SDD antes de implementación.

---

## BF-01 — Accesorios plano: pared/muro y columna

**Idea:** ampliar el catálogo de accesorios de referencia en Fase A del plano con:

- **Pared / muro** — obstáculo lineal o perímetro interior.
- **Columna** — obstáculo puntual (soporte estructural).

**Contexto actual:** catálogo en `FLOOR_PLAN_ACCESSORIES` (`floor-plan-setup.ts`); toggle en lista; posicionamiento fijo por slots (sin drag libre en piloto). Ver `ADR-016`, `SDD-01D`.

**Criterios previos a spec:**

1. Iconografía wireframe coherente (`floor-accessory-icon.tsx`).
2. Slots de posición en canvas (no solapar mesas en Fase B).
3. Persistencia API `room-setup` cuando existan coordenadas `(x,y)` (Sprint 09 P3, diferido).

**Épica relacionada:** EP-11 (plano espacial).

---

## BF-02 — Importar contactos (Outlook, Gmail, WhatsApp)

**Idea:** además del Excel estándar (EP-12), permitir precargar invitados desde:

- **Outlook** (contactos / CSV exportado).
- **Gmail** (Google Contacts).
- **WhatsApp** (lista de contactos exportable o integración futura).

**Contexto actual:** importación piloto vía plantilla `.xlsx` (`guest-import` API). HU-34–37 en `SDD-02` EP-12.

**Criterios previos a spec:**

1. Mapeo de campos → modelo invitado Taulamic (nombre, teléfono, email).
2. Consentimiento RGPD y origen del dato documentado.
3. OAuth vs upload manual (CSV/vCard) — decisión de arquitectura.
4. No sustituir Excel canónico sin aprobación SDD.

**Épica relacionada:** EP-12 (ampliación) o nueva EP-16 «Fuentes de contacto».

---

## BF-03 — Comunicación con invitados por WhatsApp

**Idea:** canal alternativo o complementario al correo para invitaciones y recordatorios RSVP (EP-09), menos intrusivo:

1. Organizador envía **enlace por WhatsApp** (manual o integrado).
2. El invitado abre un **formulario web** (campos alineados con plantilla Excel).
3. El organizador **importa** la respuesta (lote o por enlace firmado) al evento.

**Variantes a valorar:**

| Variante | Pros | Contras |
|----------|------|---------|
| Enlace genérico + Excel exportado por invitado | Bajo coste técnico | Fricción, errores de formato |
| Formulario web por evento/enlace único | Control de campos | Portal invitado parcial |
| API WhatsApp Business | Automatización | Coste, compliance, fuera piloto |

**Criterios previos a spec:**

1. Alineación con EP-09 (RSVP) y portal invitado (`ADR-019`).
2. No duplicar flujo Excel sin criterio de aceptación claro.
3. Privacidad: enlace no debe exponer datos de otros invitados.

**Épica relacionada:** EP-09 + EP-10 (UX invitado móvil).

## BF-04 — Toast duplicado en error de alta manual de invitado (desktop)

**Bug:** Al añadir un invitado manualmente y recibir un error de validación de la API, se muestran **dos mensajes de error simultáneos**: un `<Alert>` dentro del drawer (correcto) y un `toast.error()` detrás del drawer (redundante). En móvil no se percibe porque el drawer cubre la pantalla completa.

**Causa raíz:** `handleAddGuest` / `handleUpdateGuest` en `use-guests-page.ts` llaman a `toast.error(...)` y luego hacen `throw err` para que el drawer lo capture. El drawer entonces muestra su propio `<Alert>` con el detalle del error. Resultado: error duplicado.

**Corrección propuesta:** Eliminar el `toast.error(...)` del `catch` en `handleAddGuest` y `handleUpdateGuest`, dejando solo el `throw err`. El drawer se encarga de mostrar el error al usuario de forma contextual.

**Prioridad:** Baja (cosmético, solo desktop).

---

## BF-05 — Verticales empresas y aulas

**Idea:** extender el producto más allá del caso dominante boda/cena social hacia:

- **Empresas** — cenas de empresa, eventos corporativos (categorías por departamento, protocolo distinto).
- **Aulas** — formación / salas con disposición distinta (filas, capacidad pedagógica, menos «pareja keepTogether»).

**Contexto actual:** el SDD y el piloto asumen evento social tipo boda; «cenas de empresa» aparece como escenario similar en docs de producto, **sin** requisitos ni UX propios de vertical.

**Criterios previos a spec:**

1. Qué cambia de verdad vs boda (categorías, reglas duras/blandas, plano, copy, plantilla Excel).
2. Un solo producto multi-plantilla vs perfiles de evento configurables.
3. Gate PO/SDD antes de ampliar alcance funcional.

**Épica relacionada:** nueva (p. ej. EP-17 «Verticales») o amplitud de EP-01/EP-12/EP-13.

---

## BF-06 — Evaluar CP-SAT / Wasm en el navegador del cliente

**Idea:** spike técnico: ejecutar (parte de) el motor de distribución con WebAssembly **en el cliente**, no solo en el proceso Node del backend.

**Contexto actual:** ADR-023 usa `or-tools-wasm` **en servidor** (API Nest). El cálculo async es in-process; no hay solver en el browser.

**Criterios previos a spec / spike:**

1. Factibilidad (tamaño del bundle Wasm, tiempo de arranque, memoria en móvil).
2. Privacidad / no subir lista completa vs offload de CPU del servidor.
3. Paridad con motor servidor (mismas reglas) y estrategia de fallback.
4. No sustituir ADR-023 sin decisión explícita; este ítem es **evaluación**, no adopción.

**Relacionado:** ADR-023, EP-08, worker/async post-piloto.

---

## Referencias

- `docs/sdd/SDD-02-backlog-inicial.md` — épicas MVP
- `docs/agile/refactor-ui-mobile-admin.md` — deuda técnica UI admin
- `docs/adr/ADR-019-responsive-y-mobile-invitado.md`
- `docs/adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md`
