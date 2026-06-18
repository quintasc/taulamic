# Taulame

**Distribucion inteligente de mesas para eventos.**

Repositorio privado (SDD + Agile) para definir y construir Taulame: una aplicacion de distribucion de personas en eventos (bodas, cenas de empresa, clases y otros escenarios similares).

- **Marca:** Taulame
- **Dominio objetivo:** `taulame.com` (pendiente de registro)
- **Mercado inicial:** Espana
- **GitHub Project:** [Taulame](https://github.com/users/quintasc/projects/2)

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
- `docs/sdd/SDD-03-ia-asistiva-priorizada.md`: oportunidades IA priorizadas con guardarrailes.
- `docs/sdd/SDD-02-backlog-inicial.md`: backlog base para convertir SDD en Issues.
- `docs/product/PRD-v1.md`: PRD consolidado (formato unico tipo workshop).
- `docs/product/matriz-modo-preferencias.md`: guia de eleccion entre modo colaborativo o exclusivo.
- `docs/product/especificacion-plantilla-excel-v1.md`: columnas y validaciones exactas para importacion.
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
- `docs/adr/ADR-012-modo-control-preferencias-y-regla-acompanantes.md`: decision de gobernanza de preferencias por evento.
- `docs/adr/ADR-013-ia-asistiva-en-producto.md`: decision de uso de IA como asistencia.
- `docs/adr/ADR-014-evaluacion-ga-complementario.md`: decision de evaluar GA por benchmark.
- `docs/arquitectura/patrones-diseno-mvp.md`: guia practica de patrones en este dominio.
- `docs/arquitectura/estudio-estrategia-optimizacion-asientos.md`: disertacion comparativa IA vs optimizacion clasica.
- `docs/arquitectura/comparativa-ga-sa-cpsat.md`: protocolo comparativo entre estrategias.
- `docs/arquitectura/decision-motor-para-principiantes.md`: explicacion sencilla de la decision del motor.
- `docs/api/openapi-nestjs-guia.md`: guia de documentacion API para NestJS.
- `docs/glosario/glosario-principiantes.md`: terminos explicados de forma simple.
- `docs/agile/agile-para-principiantes.md`: guia basica de Agile para este proyecto.
- `docs/agile/sprint-01-plan.md`: plan de trabajo y cierre para Sprint 01.
- `docs/agile/sprint-02-plan.md`: plan de trabajo para Sprint 02 (configuracion inteligente y captura asistida).

## Estructura de codigo

- `apps/api/`: API NestJS (Sprint 02, HU-31 carga de plano).

### Arrancar API local

```bash
cd apps/api
npm install
npm run start:dev
```

- API base: `http://localhost:3000/api/v1`
- OpenAPI UI: `http://localhost:3000/api/docs`

## Como usar este repositorio

1. Leer `SDD-00` para entender problema, estrategia y objetivos.
2. Leer `PRD-v1` para vista ejecutiva consolidada.
3. Leer `SDD-01` para revisar funcionalidades y reglas de MVP.
4. Revisar `SDD-01A` para preparar flujos/pantallas en Figma.
5. Revisar `SDD-01B` para definir comparacion visual de candidatas.
6. Revisar `SDD-01C` para estilo visual y baja friccion.
7. Revisar `SDD-01D` para importacion de plano del salon.
8. Revisar `SDD-01E` para precarga de invitados con plantilla Excel.
9. Revisar `SDD-03` para estrategia de IA asistiva.
10. Revisar `SDD-02` para pasar funcionalidades a Issues.
11. Revisar ADRs para entender decisiones tecnicas ya tomadas.
12. Revisar estudio de optimizacion y ADR-006 antes de implementar el motor.
13. Revisar guia de arquitectura y API antes de implementar backend.
14. Consultar glosario cuando aparezca un termino desconocido.
15. Actualizar documentos con Pull Requests pequenos y claros.

## Nota para principiantes

No hace falta entender todo al principio. Lo importante es mantener una idea:

- Primero definimos bien el problema.
- Luego escribimos reglas y decisiones.
- Despues construimos la aplicacion.

Ese orden ahorra tiempo, errores y retrabajo.
