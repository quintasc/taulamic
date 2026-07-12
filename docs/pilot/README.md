# Piloto evaluable de TAULAMIC

## Propósito

Esta documentación describe el **alcance real y vigente** del piloto evaluable de TAULAMIC.

El SDD inicial, las decisiones y las enmiendas anteriores se conservan como **registro histórico** de la evolución del proyecto y continúan describiendo la visión completa del producto.

## Qué problema resuelve

TAULAMIC ayuda a organizar la distribución de invitados en mesas para eventos (bodas, cenas de empresa y escenarios similares), teniendo en cuenta capacidad, acompañantes, afinidades e incompatibilidades.

El piloto evaluable demuestra un flujo admin de punta a punta: configurar el evento, importar invitados, definir el espacio y las mesas, establecer preferencias, calcular una distribución, revisarla manualmente si hace falta, confirmarla y obtener un informe descargable.

## Qué permite hacer actualmente

### Evento

- Crear y configurar un evento (nombre, estados, checklist de setup).
- Metadatos de UI adicionales con persistencia local en el navegador.

### Invitados

- Alta manual y listado de invitados.
- Importación desde Excel con validación por fila.
- Categorías y claves de acompañante desde plantilla.

### Relaciones

- Reglas de acompañantes evaluadas por el motor.
- Afinidades entre invitados y entre categorías, más reglas blandas configurables.
- Funcionalidad operativa; la configuración tiene persistencia incompleta (ver limitaciones).

### Mesas

- Alta, edición y eliminación de mesas (forma, capacidad, etiqueta).
- Catálogo de formas y topología de asientos por API.

### Distribución

- Cálculo con motor CP-SAT v1 (por defecto) o motor v0 (fallback).
- Cálculo asíncrono con estado y barra de progreso.
- Una propuesta de asignación (sin comparador Top-K).

### Ajustes manuales

- Desasignar, asignar y mover invitados entre mesas en estado borrador.
- Advertencias de acompañantes separados en ajuste manual (override documentado en ADR-022).

### Plano

- Configuración Fase A del salón (forma, medidas, accesorios) con persistencia API.
- Vista de layout con mesas posicionadas; parte del posicionamiento visual en localStorage.

### Sillas

- Asignación por silla S1…Sn con API canónica (`seatIndex`); estado local auxiliar todavía coexistente.
- Representación visual de mesas y sillas en distribución y plano.
- Marca de silla presidencial (orientación) en localStorage.

### Confirmación

- Confirmar distribución; bloqueo de recálculo y edición estructural tras aprobar el plan.

### Exportación

- Informe PDF al confirmar: generado en frontend; no persistido como documento backend.
- Implementación parcial de HU-08 (organizadores); documento de cocina pendiente.

### Calidad técnica

- Tests unitarios de dominio, E2E API del piloto y E2E Playwright del flujo admin.
- Scripts smoke y benchmark del motor CP-SAT (ejecución manual post-build).

## Qué queda fuera del piloto

- Comparador Top-K de candidatas (HU-09).
- RSVP e invitaciones digitales (HU-10, HU-11).
- Publicación programada a invitados (HU-07).
- Documento operativo de cocina (HU-08 completa).
- Portal invitado y modo colaborativo en UI.
- Diseño de tarjetas de invitación.
- Subida de plano imagen/PDF desde la interfaz admin.
- Auth JWT/RBAC completo y PostgreSQL en producción.
- Worker BullMQ / cola externa de distribución.

## Limitaciones conocidas

| Tipo | Ejemplos |
|------|----------|
| Persistencia backend | Eventos, invitados, mesas, distribución, room-setup (ficheros JSON en `uploads/`) |
| Persistencia local | Afinidades, reglas blandas, posiciones custom del plano, `guestChairs`, estrella presidencial, metadatos UI |
| Funcionalidad parcial | HU-08 (PDF organizador sin documento cocina), afinidades (config no centralizada), asignación por silla (convivencia API + local) |
| Funcionalidad experimental | Motor CP-SAT v1 como default en producción; E2E API validan motor v0 |
| Backend sin UI piloto | Subida plano imagen, auditoría gobernanza, separar acompañantes, sugerencias restricciones |

## Estado documental

| Rol | Documento |
|-----|-----------|
| MVP completo (visión producto) | [`SDD-01-borrador-mvp.md`](../sdd/SDD-01-borrador-mvp.md) |
| Gobernanza SDD | [`SDD-GOVERNANZA-PROTECCION-SDD.md`](../sdd/SDD-GOVERNANZA-PROTECCION-SDD.md) |
| Línea base del recorte original (jun 2026) | [`DECISION-002`](../agile/DECISION-002-mvp-julio-piloto-funcional.md) |
| Snapshot de alineación (jun 2026, desactualizado) | [`SDD-PILOTO-alineacion-y-huecos.md`](../sdd/SDD-PILOTO-alineacion-y-huecos.md) |
| Ampliaciones posteriores | Enmiendas HU-05 (2b, 2c), [`ADR-023`](../adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md), [`ADR-024`](../adr/ADR-024-reparto-proporcional-por-categoria.md) |
| Visión de producto previa | [`PRD-v1.md`](../product/PRD-v1.md) |
| **Referencia vigente del piloto evaluable** | Esta carpeta (`docs/pilot/`) |

## Ruta de lectura recomendada

1. Este documento — resumen del piloto.
2. [`ALCANCE-ACTUAL.md`](ALCANCE-ACTUAL.md) — qué está implementado ahora, con evidencia.
3. [`EVOLUCION-DEL-ALCANCE.md`](EVOLUCION-DEL-ALCANCE.md) — cómo cambió el alcance respecto al planteamiento inicial.
4. [`TRAZABILIDAD.md`](TRAZABILIDAD.md) — requisitos evaluables del piloto con enlaces a código y pruebas.
5. [`SDD-01-borrador-mvp.md`](../sdd/SDD-01-borrador-mvp.md) — especificación del MVP completo.
6. [`DECISION-002`](../agile/DECISION-002-mvp-julio-piloto-funcional.md) y ADRs — decisiones y contexto histórico.

## Capacidades técnicas sin interfaz de usuario

Existen endpoints backend implementados que no forman parte del flujo admin evaluable de punta a punta. Se documentan en [`ALCANCE-ACTUAL.md`](ALCANCE-ACTUAL.md#capacidades-técnicas-disponibles-sin-interfaz-de-usuario) y en [`TRAZABILIDAD.md`](TRAZABILIDAD.md), con estado `Implementado en backend / sin UI piloto`.

## Relación con la gobernanza SDD

- El **SDD completo** sigue describiendo la visión del producto; no se rebaja retroactivamente.
- Esta carpeta describe la **línea base evaluable actual** del piloto.
- Las diferencias entre documentos históricos y el estado real se conservan y se explican en [`EVOLUCION-DEL-ALCANCE.md`](EVOLUCION-DEL-ALCANCE.md).
- Lo pospuesto permanece en el roadmap del MVP; lo adelantado se incorpora mediante trazabilidad.
