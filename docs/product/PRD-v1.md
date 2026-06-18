# PRD v1 - Taulame

- Producto: **Taulame** — distribucion inteligente de mesas para eventos
- Estado: Borrador consolidado
- Fecha: 2026-06-17
- Fuente: Sintesis de `docs/sdd` + `docs/adr`

## 1) Resumen ejecutivo

La aplicacion resuelve la gestion integral de invitados para eventos (bodas, empresa, etc.) combinando:

- configuracion de salon y mesas,
- invitaciones y RSVP,
- captura/pre-carga de datos de invitados,
- y optimizacion de distribucion de asientos con restricciones.

El producto prioriza facilidad de uso para usuarios no tecnicos y control flexible para anfitriones.

## 2) Problema

Hoy, organizar invitados suele implicar:

- multiples herramientas desconectadas,
- hojas de calculo manuales,
- baja trazabilidad de decisiones,
- y mucho esfuerzo en ajustes de ultima hora.

## 3) Propuesta de valor

Ofrecer una sola plataforma que permita:

- crear y mantener una distribucion de alta calidad,
- reducir carga manual desde importaciones asistidas,
- mejorar coordinacion entre anfitriones, invitados y salon,
- y mantener privacidad y control de datos sensibles.

## 4) Personas y roles

- `Admin` (novios/anfitriones/planner): configura reglas, revisa propuestas, aprueba.
- `Invitado`: confirma asistencia y, segun modo, aporta preferencias.
- `Salon`: consulta salida operativa necesaria.

## 5) Modos de gobernanza de preferencias

Por evento se define:

- `colaborativo`: invitados pueden aportar preferencias de asiento.
- `anfitrion_exclusivo`: solo admins editan afinidades/incompatibilidades.

Regla base:

- acompanantes juntos por defecto, salvo excepcion explicita.

## 6) Alcance MVP (in)

- Configuracion manual de evento, mesas y formas de mesa.
- Importacion asistida de plano (JPG/PNG/PDF) con confirmacion manual.
- Precarga de invitados desde plantilla Excel estandar.
- Envio de invitaciones y gestion RSVP.
- Captura de restricciones (afinidades, incompatibilidades, necesidades especiales).
- Motor de distribucion con Top-K candidatas.
- Comparador visual rapido de candidatas.
- Aprobacion final, versionado y publicacion controlada.

## 7) Fuera de alcance MVP (out)

- App movil nativa.
- Facturacion/pagos integrados.
- Integraciones profundas con software externo de salones.

## 8) Requisitos funcionales clave

- RF-01: gestionar mesas con forma/capacidad y topologia de asientos.
- RF-02: importar plano y proponer configuracion de mesas con confianza.
- RF-03: descargar plantilla Excel y subir precarga masiva de invitados.
- RF-04: mapear observaciones a restricciones sugeridas con aprobacion manual.
- RF-05: enviar invitaciones y registrar RSVP en tiempo real.
- RF-06: calcular distribucion respetando reglas duras.
- RF-07: conservar y comparar Top-K candidatas (K parametrizable).
- RF-08: permitir ajustes manuales y aprobacion versionada.
- RF-09: soportar modo colaborativo o anfitrion_exclusivo por evento.

## 9) Requisitos UX/UI

- Estilo sobrio, elegante, poco cargado y amable.
- Baja friccion en tareas clave:
  - configurar evento,
  - cargar invitados,
  - responder RSVP,
  - comparar candidatas.
- Benchmark de referencia (inspiracion): PerfectTablePlan, Planning Pod, Prismm.

## 10) Requisitos no funcionales (objetivos iniciales)

- p95 API lectura < 250 ms.
- p95 API escritura < 500 ms.
- Feedback UI < 200 ms.
- Comparacion Top-3 en < 2 minutos por admin novato.
- Carga masiva 500 invitados en <= 90 s objetivo.
- Validacion de Excel en <= 15 s objetivo.

## 11) Estrategia tecnica (alto nivel)

- App web responsive.
- Backend monolito modular + worker asincrono.
- Motor de optimizacion combinatoria hibrido.
- OpenAPI/Swagger como contrato de API.

## 12) Estrategia de optimizacion

Base actual:

1. heuristica constructiva,
2. mejora por busqueda local + simulated annealing,
3. refinamiento opcional exacto (Branch and Bound / CP-SAT).

Reglas:

- cero violaciones de reglas duras,
- Top-K candidatas validas para decision admin.

## 13) IA en el producto (enfoque recomendado)

IA como asistente, no como arbitro final de asignacion:

- deteccion en importacion de plano,
- sugerencias desde observaciones Excel,
- explicabilidad de propuestas,
- ayudas de redaccion de comunicaciones.

## 14) KPIs de producto

- tiempo de cierre de distribucion por evento,
- porcentaje de propuesta automatica aceptada,
- cambios manuales por evento,
- tasa de completitud de invitados,
- tiempo de calculo p95,
- incidencias operativas reportadas por salon.

## 15) Riesgos principales

- reglas contradictorias,
- baja calidad de datos importados,
- sobrecarga de calculo en eventos grandes,
- confusion de permisos entre modos colaborativo/exclusivo.

## 16) Trazabilidad (documentos fuente)

- Vision/estrategia: `docs/sdd/SDD-00-vision-y-estrategia.md`
- Alcance y requisitos: `docs/sdd/SDD-01-borrador-mvp.md`
- UX y flujos: `docs/sdd/SDD-01A-figma-ui-ux.md`
- Backlog: `docs/sdd/SDD-02-backlog-inicial.md`
- Decisiones tecnicas: `docs/adr/ADR-*.md`

## 17) Nota para principiantes

Este PRD resume el "que y por que".
Los archivos SDD y ADR explican el detalle de "como" y "con que decision".
