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

## BF-07 — Mejorar el sistema de logging (post-piloto)

**Idea:** pasar del logging mínimo actual (Nest `Logger` puntual + Sentry opcional para errores) a una estrategia de logs más útil en operación, sin sustituir Sentry como monitorización de fallos.

**Contexto actual:** no hay logger estructurado centralizado ni política uniforme de trazas; ver `docs/agile/observabilidad-y-e2e-web-piloto.md` y la arquitectura operativa del piloto.

**Criterios previos a spec:**

1. Qué eventos de negocio y técnicos deben registrarse (p. ej. `eventId`, fase del motor, fallos de persistencia) y con qué nivel.
2. Formato estructurado (JSON u otro) y destino (stdout/Docker, fichero, servicio externo).
3. **No** volcar datos personales sensibles en logs (nombres, contactos, afinidades, parentescos) — coordinar con BF-08.
4. Relación con Sentry: errores/alertas vs audit trail operativo; evitar duplicar esfuerzo.
5. Gate PO/ops antes de adoptar librería (Pino/Winston/etc.) o infraestructura de logs.

**Épica relacionada:** observabilidad / ops post-piloto (complementa auth, BD y worker cuando existan).

---

## BF-08 — Protección de datos personales y cumplimiento LOPD / LOPDGDD (RGPD)

**Idea:** revisar y reforzar que la información sensible que Taulamic recoge y trata quede **bien protegida y sea privada**, cumpliendo la normativa aplicable en España (**LOPD** en lenguaje habitual; marco vigente **LOPDGDD** + **RGPD**).

**Datos de especial atención en este producto:**

- Datos de **personas** (identidad de invitados).
- **Contactos** (teléfono, email u otros medios).
- **Parentescos** / grupos de acompañantes y relaciones familiares.
- **Afinidades e incompatibilidades** (preferencias sociales que pueden ser sensibles).

**Contexto actual (piloto):** persistencia en ficheros JSON/`uploads/`, parte de configuración en `localStorage`, sin login de producto ni modelo de consentimiento/retención documentado como producto; actor admin por cabecera interna. No asumir cumplimiento completo hasta esta revisión.

**Criterios previos a spec / revisión:**

1. Inventario de datos personales tratados (qué, para qué, dónde se almacenan, quién accede).
2. Bases de legitimación, minimización, retención y derecho de acceso/supresión/rectificación.
3. Medidas técnicas: cifrado en tránsito/reposo, control de acceso (auth), segregación por evento, backups.
4. Que **logs, Sentry, PDF y exportaciones** no filtren más datos de los necesarios (enlace con BF-07).
5. Política de privacidad / aviso informativo alineado con el producto real (no solo texto genérico).
6. Gate legal/PO + decisión SDD/ADR si implica cambios de alcance o arquitectura (p. ej. auth, PostgreSQL).

**Épica relacionada:** seguridad y privacidad post-piloto; encaja con auth JWT/RBAC y migración de persistencia cuando se acometan.

---

## BF-09 — Escalabilidad multi-usuario concurrente (post-éxito)

**Idea:** analizar y preparar el comportamiento del sistema si el producto tiene éxito y **varios usuarios / organizadores** acceden a la web **de forma concurrente** (no solo un admin de piloto).

Esto es **distinto** de los NFR de latencia del motor/API (p95 en SDD-01 / ADR-023): aquí el foco es **concurrencia, aislamiento y ops**, no solo “que el solver sea rápido”.

**Contexto actual (piloto):** un organizador / pocos usos; JSON en `uploads/`; jobs de distribución async **en memoria del proceso** Node (sin cola BullMQ/Redis); sin multi-tenant ni auth de producto. Reiniciar API pierde jobs en curso. Ver `docs/arquitectura/arquitectura-operativa-piloto.md` y ADR-002 (worker/cola previstos a largo plazo).

**Riesgos si se escala sin rediseño:**

- Contención y corrupción/condiciones de carrera en ficheros JSON.
- Jobs de cálculo que se pisan o se pierden entre instancias/reinicios.
- Falta de aislamiento entre eventos/organizadores.
- Imposible repartir carga horizontalmente con el tracker in-process actual.

**Criterios previos a spec / spike:**

1. Modelo de usuarios y tenancy (un organizador ≈ N eventos; varios orgs concurrentes).
2. Persistencia concurrente-safe (p. ej. PostgreSQL) y migrar fuera de JSON de piloto.
3. Cola de jobs durable (Redis/BullMQ u equivalente) para `distribution/run`.
4. Auth/sesiones (enlace EP-06 / deuda auth HttpOnly en CONTEXTO) y límites por usuario.
5. Pruebas de carga concurrente (escenarios: K organizadores, M cálculos a la vez) y criterios de aceptación (errores, latencia, jobs perdidos = 0).
6. Observabilidad (enlace BF-07) para diagnosticar contención.
7. Gate PO/arquitectura + ADR antes de cambiar el runtime del piloto.

**Épica relacionada:** ops / plataforma post-piloto; ADR-002, EP-06, EP-03 (async), BF-07, BF-08. Issue: [#56](https://github.com/quintasc/taulamic/issues/56).

---

## BF-10 — Desacoplar features Nest (límites de módulo)

**Idea:** reducir el acoplamiento estructural entre módulos del monolito Nest (`apps/api`) sin cambiar el alcance funcional del SDD. La organización por features (ADR-015) es correcta; la deuda es **imports cruzados y hubs** que dificultan evolucionar Guest, RSVP, multi-usuario o extraer un worker.

**Contexto actual (piloto):** aceptable para MVP. Problemas conocidos:

- `GUEST_REPOSITORY` / dominio Guest viven en **`guest-import`** y lo consumen guests, preferences, companions y distribution.
- **Distribution** importa domain de events, guest-import y floor-plans.
- **Events** toca lógica/persistencia de distribution (p. ej. reconciliar al quitar mesa) en lugar de orquestar solo vía application de distribution.
- Use cases de permisos/auditoría importados `application` → `application` entre features; ciclo Nest `events` ↔ `event-governance-audit` (`forwardRef`).
- Sin enforcement de boundaries (no Nx/ESLint import rules).

**Distinto de:** BF-09 (runtime concurrente JSON/jobs); refactor UI en CONTEXTO; #54 motor L2.

**Criterios previos a spec / spike:**

1. Extraer agregado **Guest** (puerto + módulo) fuera de `guest-import`; import Excel queda como adaptador/use cases.
2. Events no importa `distribution/domain` ni infra: reconciliación vía use case exportado de distribution (o puerto).
3. Auth/governance como módulo transversal o puertos; dejar de esparcir `Assert*UseCase` acoplados a events.
4. Valorar reglas de import (ESLint) entre features.
5. Gate: solo al tocar esas zonas o al acometer BF-09 / RSVP / migración BD — **no** refactor masivo sin feature.
6. ADR-015 / ADR-002: enmienda solo si cambia la convención de carpetas o los límites.

**Épica relacionada:** mantenimiento arquitectura API; ADR-015, ADR-002. Issue: [#57](https://github.com/quintasc/taulamic/issues/57).

---

## BF-11 — Valorar Zod o Joi (validación) post-piloto

**Idea:** el piloto valida HTTP con **`class-validator` + `class-transformer`** (DTOs Nest) y validadores de dominio a mano. **No** migrar ahora a Zod/Joi. Sí **reevaluar** si el proyecto cambia en los casos siguientes.

**Contexto actual:** Nest + OpenAPI alimentado por DTOs; coste de migración alto; beneficio bajo sin schemas compartidos API↔web (ver evaluación 2026-08-05 en conversación de arquitectura).

**Cuándo abrir spike / ADR (post-piloto o cambio de filosofía):**

1. Contrato tipado compartido frontend↔API (paquete común, generación de cliente, menos DTOs duplicados).
2. Nuevo módulo grande (p. ej. RSVP / portal invitado) donde convenga schemas composables **sin** big-bang del resto.
3. Dolor real con `class-validator` (mantenimiento, tipado, reflect-metadata) documentado en issues.
4. Cambio de filosofía de stack (p. ej. menos Nest “clásico”, más validación funcional / tRPC-like) — entonces enmendar **ADR-003** con aprobación explícita.

**Fuera de alcance ahora:** sustituir la suite de DTOs del piloto; adoptar Zod “por moda”.

**Criterios del spike (si se abre):** comparar Zod vs Joi vs seguir `class-validator`; impacto OpenAPI/Swagger; plan de convivencia o migración por feature; gate PO/arquitectura.

**Épica relacionada:** stack / calidad API; ADR-003, ADR-005 (OpenAPI), ADR-015. Issue: [#58](https://github.com/quintasc/taulamic/issues/58).

---

## BF-12 — Spike ORM al migrar a PostgreSQL (Prisma / TypeORM / Drizzle / …)

**Idea:** ADR-003 y el SDD ya fijan **PostgreSQL** post-piloto. **No** está decidido el acceso a datos (ORM o SQL). Al acometer la migración desde JSON/`uploads/`, abrir un **spike + ADR** que compare opciones; **Prisma** es candidato válido, no la única.

**Contexto actual:** repositorios fichero (`File*Repository`) detrás de puertos (ADR-015). Dominio sin ORM.

**Candidatos a valorar (no exhaustivo):**

| Opción | Encaje típico |
|--------|----------------|
| **Prisma** | DX, migraciones, tipado; adaptador en `infrastructure/` |
| **TypeORM** | Muy usado con Nest; entidades/decoradores |
| **Drizzle** | SQL-like, ligero |
| **`pg` / SQL** | Control fino, más código a mano |

**Criterios del spike:**

1. Mantener **puertos Repository** en domain/application; ORM solo en infrastructure (no filtrar Prisma al dominio).
2. Migraciones, transacciones (eventos + invitados + distribución), testcontainers o equivalente.
3. Impacto en BF-09 (concurrencia), BF-08 (LOPD), auth (EP-06).
4. Coste de migración desde JSON y curva del equipo.
5. Gate PO/arquitectura + ADR de persistencia (nuevo o enmienda ADR-003) **antes** de adoptar librería.

**Fuera de alcance ahora:** elegir Prisma (u otro) en seco; reescribir repositorios del piloto sin feature de migración BD.

**Épica relacionada:** persistencia post-piloto; ADR-002, ADR-003, ADR-015, BF-09, BF-08. Issue: [#59](https://github.com/quintasc/taulamic/issues/59).

---

## Referencias

- `docs/sdd/SDD-02-backlog-inicial.md` — épicas MVP
- `docs/agile/refactor-ui-mobile-admin.md` — deuda técnica UI admin
- `docs/agile/observabilidad-y-e2e-web-piloto.md` — Sentry / observabilidad piloto
- `docs/adr/ADR-002-arquitectura-monolito-modular-worker.md`
- `docs/adr/ADR-003-stack-tecnologico-inicial.md`
- `docs/adr/ADR-015-clean-architecture-pragmatica-y-features.md`
- `docs/adr/ADR-019-responsive-y-mobile-invitado.md`
- `docs/adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md`
- `docs/arquitectura/arquitectura-operativa-piloto.md` — runtime y persistencia actuales
- `docs/sdd/SDD-01-borrador-mvp.md` §9 — NFR de latencia (complementarios, no sustituyen BF-09)
