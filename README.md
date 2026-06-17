# App de Distribucion de Mesas (SDD)

Repositorio privado para definir, paso a paso, una aplicacion de distribucion de personas en eventos (bodas, cenas de empresa, clases y otros escenarios similares).

## Objetivo del repositorio

Este repositorio guarda decisiones de producto y tecnologia antes de programar en grande, usando enfoque SDD (Spec-Driven Development).

## Para quien esta pensado este contenido

- Personas muy principiantes en SDD.
- Personas muy principiantes en desarrollo web.
- Personas muy principiantes en metodologias Agile.

## Estructura inicial

- `docs/sdd/SDD-00-vision-y-estrategia.md`: contexto, segmento objetivo y KPIs.
- `docs/sdd/SDD-01-borrador-mvp.md`: alcance MVP, historias y criterios de aceptacion.
- `docs/sdd/SDD-01A-figma-ui-ux.md`: cuando y como usar Figma dentro de SDD.
- `docs/sdd/SDD-01B-comparacion-visual-candidatas.md`: como comparar rapido Top-K candidatas.
- `docs/sdd/SDD-01C-principios-estilo-y-baja-friccion.md`: direccion visual y criterios UX de uso simple.
- `docs/sdd/SDD-01D-importacion-plano-salon.md`: carga asistida de plano desde imagen/PDF.
- `docs/sdd/SDD-01E-precarga-invitados-excel.md`: plantilla y carga masiva de invitados por Excel.
- `docs/sdd/SDD-02-backlog-inicial.md`: backlog base para convertir SDD en Issues.
- `docs/adr/ADR-001-tipo-app-web-primero.md`: decision sobre tipo de app inicial.
- `docs/adr/ADR-002-arquitectura-monolito-modular-worker.md`: decision de arquitectura.
- `docs/adr/ADR-003-stack-tecnologico-inicial.md`: decision de stack base.
- `docs/adr/ADR-004-patrones-diseno-mvp.md`: decision de patrones de diseno para MVP.
- `docs/adr/ADR-005-documentacion-api-openapi-nestjs.md`: decision de contrato API y docs OpenAPI.
- `docs/adr/ADR-006-estrategia-optimizacion-motor-asignacion.md`: decision de estrategia del motor NP-hard.
- `docs/adr/ADR-007-top-k-soluciones-candidatas.md`: decision de conservar mejores candidatas antes de aprobar.
- `docs/adr/ADR-008-alcance-invitaciones-rsvp-y-principios-ux.md`: decision de alcance funcional y direccion UX.
- `docs/adr/ADR-009-forma-mesa-y-topologia-de-asientos.md`: decision sobre geometria de mesas y cercania real.
- `docs/adr/ADR-010-importacion-plano-imagen-pdf.md`: decision de importacion automatica asistida.
- `docs/adr/ADR-011-precarga-invitados-excel-estandar.md`: decision de precarga de invitados por lote.
- `docs/arquitectura/patrones-diseno-mvp.md`: guia practica de patrones en este dominio.
- `docs/arquitectura/estudio-estrategia-optimizacion-asientos.md`: disertacion comparativa IA vs optimizacion clasica.
- `docs/arquitectura/decision-motor-para-principiantes.md`: explicacion sencilla de la decision del motor.
- `docs/api/openapi-nestjs-guia.md`: guia de documentacion API para NestJS.
- `docs/glosario/glosario-principiantes.md`: terminos explicados de forma simple.
- `docs/agile/agile-para-principiantes.md`: guia basica de Agile para este proyecto.
- `docs/agile/sprint-01-plan.md`: plan de trabajo y cierre para Sprint 01.

## Como usar este repositorio

1. Leer `SDD-00` para entender problema, estrategia y objetivos.
2. Leer `SDD-01` para revisar funcionalidades y reglas de MVP.
3. Revisar `SDD-01A` para preparar flujos/pantallas en Figma.
4. Revisar `SDD-01B` para definir comparacion visual de candidatas.
5. Revisar `SDD-01C` para estilo visual y baja friccion.
6. Revisar `SDD-01D` para importacion de plano del salon.
7. Revisar `SDD-01E` para precarga de invitados con plantilla Excel.
8. Revisar `SDD-02` para pasar funcionalidades a Issues.
9. Revisar ADRs para entender decisiones tecnicas ya tomadas.
10. Revisar estudio de optimizacion y ADR-006 antes de implementar el motor.
11. Revisar guia de arquitectura y API antes de implementar backend.
12. Consultar glosario cuando aparezca un termino desconocido.
13. Actualizar documentos con Pull Requests pequenos y claros.

## Nota para principiantes

No hace falta entender todo al principio. Lo importante es mantener una idea:

- Primero definimos bien el problema.
- Luego escribimos reglas y decisiones.
- Despues construimos la aplicacion.

Ese orden ahorra tiempo, errores y retrabajo.
