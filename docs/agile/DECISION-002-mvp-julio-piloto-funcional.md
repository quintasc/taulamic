> [!NOTE]
> **Estado documental: línea base del piloto reducido.**
> Este documento recoge la decisión original de alcance adoptada en junio de 2026. Sigue siendo válido como registro de dicha decisión, pero no refleja las ampliaciones y funcionalidades adelantadas posteriormente. Para consultar el alcance vigente del piloto evaluable, véase [`docs/pilot/README.md`](../pilot/README.md).

# DECISION-002 - MVP julio: piloto funcional (alcance acotado)

- Estado: **Aceptada**
- Fecha: 2026-06-18 · **Enmienda plano 2026-06-23:** `ADR-016`
- Decisor: Carmen Quintas Ramirez (product owner)
- Fecha objetivo piloto: **2026-07-31**
- Plan de ejecucion: `docs/agile/mvp-julio-plan.md`

## Contexto

El SDD-01 define el **MVP completo** del producto (18 bloques funcionales, 15 epicas).
El equipo quiere un **piloto funcional** con usuarios reales **antes de finales de julio 2026**, sin abandonar el desarrollo completo posterior.

Hoy el proyecto tiene:

- SDD, ADRs y backlog cerrados.
- Sprint 02 en ejecucion (#22–#25 del EP-11 cerradas en backend).
- Sprint 01 pospuesto (DECISION-001).
- Sin frontend Next.js ni motor de asignacion aun.

## Decision

Se define un hito intermedio **MVP julio (piloto)**, distinto del **MVP SDD completo**:

1. **MVP julio** = producto minimo **demostrable en un evento piloto** (admin configura salon + invitados + obtiene una distribucion basica confirmada).
2. **MVP SDD completo** = alcance total de `SDD-01-borrador-mvp.md`; **sigue siendo el objetivo** y se desarrolla **despues del piloto** (desde agosto 2026 en adelante).
3. Esta decision **no rebaja ni elimina requisitos del SDD**; **aplaza** explicitamente lo no necesario para el piloto.
4. Toda funcionalidad pospuesta mantiene sus criterios de aceptacion originales para fases posteriores.

## Alcance IN del MVP julio (piloto)

Un admin debe poder completar este flujo de punta a punta:

| Paso | Capacidad | Referencia SDD / issues |
|------|-----------|-------------------------|
| 1 | **Plano Fase A:** forma y medidas del salon + mesas en pantalla Mesas (manual/API) | `ADR-016`, `SDD-01D`, HU-01, HU-12 — UI `0f15b37`. API EP-11 detect mesas: **legacy**, no UI principal |
| 2 | Importar invitados desde Excel con validacion por fila | EP-12 (#27–#31) |
| 3 | Configurar modo preferencias (colaborativo/exclusivo) basico | EP-13 (#32–#36) |
| 4 | Crear evento y mesas (API minima; UI admin minima) | EP-01 (#1, #15) |
| 5 | Registrar invitados con datos base | EP-02 (#2) — version reducida |
| 6 | Ejecutar **motor v0** (asignacion simple, reglas duras basicas) | Derivado EP-03 — **alcance piloto** |
| 7 | Ver resultado y confirmar distribucion para el piloto | Flujo C/D simplificado |

### Criterio de exito del piloto (31 jul 2026)

- Un organizador real (o simulado) completa el flujo en **menos de 30 minutos** con ayuda minima.
- Datos de evento, mesas e invitados persisten entre sesiones.
- Existe evidencia de prueba (E2E o guion manual documentado).
- OpenAPI actualizado para endpoints del piloto.

**Enmienda 2026-06-24 (PO):** no hay organizador real disponible en la fase piloto julio. Cierre del hito con **organizador simulado** (validación manual PO `sesion-2026-06-24.md` + E2E API/Playwright). Prueba con usuario real pospuesta a post-piloto ([#53](https://github.com/quintasc/taulamic/issues/53)).

## Alcance OUT del MVP julio (pospuesto post-piloto)

Queda **fuera del piloto** pero **dentro del MVP SDD completo**:

| Bloque pospuesto | Motivo |
|------------------|--------|
| Top-K candidatas + comparador visual | Complejidad EP-08; motor v0 basta para piloto |
| Worker asincrono + cola BullMQ | Motor v0 sincrono aceptable en piloto pequeno |
| RSVP e invitaciones digitales | EP-09; no bloquea validar distribucion |
| Documentos cocina/salon PDF | EP-05 |
| IA real en deteccion de mesas desde plano | Sustituido por plano espacial (`ADR-016`); API EP-11 legacy en backend |
| Figma completo / Sprint 01 (#7) | SDD-01A como referencia UX hasta despues |
| Roles invitado y salon en UI | Solo admin en piloto |
| Benchmark GA / EP-15 | Post-MVP |
| PostgreSQL en produccion | Persistencia piloto: ficheros o SQLite; migracion agosto+ |
| Auth JWT/RBAC completo | Admin unico en piloto; auth completo post-piloto |

## Motor v0 (alcance explicito del piloto)

Para no confundir con ADR-006/EP-08:

- **Entrada:** mesas confirmadas + invitados importados + reglas duras basicas (capacidad, incompatibilidades explicitas si existen).
- **Salida:** una unica propuesta de asignacion (no Top-K).
- **Reglas duras minimas:** no superar capacidad de mesa; respetar incompatibilidades registradas; acompanantes juntos si aplica (#40 simplificado).
- **Etiqueta:** `motorVersion: "v0-pilot"` en respuesta API para trazabilidad.
- **Post-piloto:** sustituir/ampliar por motor EP-08 segun SDD sin borrar datos del piloto.

## Plan temporal resumido

Ver detalle semanal en `mvp-julio-plan.md`.

| Periodo | Foco |
|---------|------|
| 18–29 jun | Cerrar EP-11 (#26) + Excel (#27–#31) |
| 30 jun – 6 jul | Preferencias (#32–#36) + EP-01 evento/mesas |
| 7–13 jul | EP-02 invitados + integracion datos |
| 14–20 jul | Frontend admin minimo (Next.js) |
| 21–31 jul | Motor v0 + prueba piloto + ajustes |

## Motivos

- Validar valor con usuarios reales antes de invertir en motor avanzado y UI completa.
- Mantener momentum tecnico del Sprint 02.
- Reducir riesgo de perseguir el SDD completo en plazo irreal (6 semanas).

## Consecuencias

### Positivas

- Hito claro y medible (31 jul).
- Feedback temprano de organizadores reales.
- Base de codigo (EP-11) reutilizable para MVP completo.

### Negativas / riesgos

- Deuda tecnica: persistencia en ficheros, motor v0, auth ausente.
- Expectativas de usuarios si no se comunica que es **piloto**, no producto final.
- **Mitigacion:** comunicar "piloto julio" vs "lanzamiento completo"; documentar deuda en issues post-piloto.

## Relacion con gobernanza SDD

| Pregunta | Respuesta |
|----------|-----------|
| ¿Se elimina algun requisito del SDD? | **No.** |
| ¿Se cambian criterios de aceptacion del SDD? | **No.** |
| ¿Que cambia? | **Orden y fecha** de entrega por fases. |
| ¿Que manda en conflictos? | SDD sigue siendo fuente de verdad funcional. |

## Criterio de cierre del MVP julio

El hito se considera logrado cuando:

- Flujo piloto completado con evidencia (test E2E o guion manual + capturas).
- Issues del alcance IN cerradas o documentadas con motivo.
- Backlog **post-piloto** (Sprint 03+) preparado con lo pospuesto.
- Deuda tecnica registrada en GitHub (issues etiquetadas `post-piloto`).

## Referencias

- `docs/adr/ADR-016-plano-espacial-salon-dos-fases.md`
- `docs/sdd/SDD-01-borrador-mvp.md` (MVP completo — objetivo final)
- `docs/agile/DECISION-001-sprint-01-pospuesto-opcion-b.md`
- `docs/agile/mvp-julio-plan.md`
- `docs/agile/sprint-02-plan.md`
