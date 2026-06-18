# Sprint 02 - Plan de ejecucion

> **Decision de ejecucion (Opcion B):** Sprint 01 pospuesto; este es el sprint activo.  
> Ver `docs/agile/DECISION-001-sprint-01-pospuesto-opcion-b.md`. Seguimiento: #21.

## 1) Objetivo del sprint
Entregar configuracion inteligente del salon y captura asistida de datos para reducir el esfuerzo inicial del admin.

## 2) Duracion sugerida

- 2 semanas.
- Fecha inicio sugerida: 2026-06-17.
- Fecha fin sugerida: 2026-07-14.
- Issue de seguimiento: #21.

## 3) Alcance de Sprint 02

Epicas comprometidas:

- #15 - [EP-01] Forma de mesa y topologia de asientos
- #16 - [EP-11] Importacion de plano por imagen/PDF (#22-#26)
- #17 - [EP-12] Precarga de invitados desde Excel (#27-#31)
- #18 - [EP-13] Modo de control de preferencias y acompanantes (#32-#36)

## 4) Orden de ejecucion recomendado

**Regla vigente (DECISION-001):** completar y validar **#22** antes de iniciar **#23**.

1. **#22** Carga y validacion de plano (base tecnica de importacion). **Validacion tecnica completada — pendiente cierre formal en GitHub (#22).**
2. **#23** Deteccion asistida de mesas con confianza.
3. **#24** Editor de correccion manual y confirmacion final.
4. **#25** Persistencia y versionado de layout importado.
5. **#26** Pruebas E2E y calidad de importacion de plano.
6. **#27-#31** Flujo Excel en paralelo cuando #22-#24 esten estables.
7. **#32-#36** Modos de preferencias y acompanantes.
8. **#15** Forma de mesa (si no se desglosa antes, ejecutar cuando el layout base exista).

## 5) Dependencias

- #23 depende de #22 (archivo valido subido).
- #24 depende de #23 (propuesta de deteccion).
- #25 depende de #24 (layout confirmado).
- #28-#29 dependen de #27 (plantilla y contrato de columnas).
- #33-#34 dependen de #32 (modo configurado por evento).

## 6) Entregables esperados

- API NestJS inicial con modulo de carga de plano (JPG/PNG/PDF).
- Flujo de importacion asistida de plano con confirmacion manual.
- Plantilla Excel v1 y pipeline de importacion por lote.
- Modos de preferencias (colaborativo/exclusivo) con regla de acompanantes.
- Documentacion alineada (SDD/ADR/OpenAPI) si cambia el comportamiento.

## 7) Criterio de cierre del sprint

El sprint se considera cerrado cuando:

- Todas las issues del milestone Sprint 02 estan cerradas o explicitamente movidas fuera con motivo.
- Cada issue cumple sus criterios de aceptacion con evidencia minima.
- Los flujos criticos (#16, #17, #18) tienen prueba funcional o E2E basica.
- Riesgos y bloqueos quedan documentados en #21.

## 8) Riesgos del sprint y mitigacion

- Riesgo: deteccion de mesas imprecisa en planos reales.
  - Mitigacion: flujo asistido + edicion manual sin bloqueo (ADR-010).
- Riesgo: Excel con formatos heterogeneos de clientes.
  - Mitigacion: plantilla estricta v1 + reporte de errores por fila.
- Riesgo: arranque de codigo desde repo solo-documentacion.
  - Mitigacion: primer vertical slice en #22 antes de abrir frentes paralelos.

## 9) Definition of Done del Sprint 02

- Historias cerradas con criterios verificados contra el SDD (sin degradacion funcional; ver `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`).
- Validacion tecnica segun `docs/agile/politica-validacion-tests-y-cobertura.md` (build + tests en verde; cobertura segun fase activa).
- Contrato API documentado en OpenAPI para endpoints nuevos.
- Tests unitarios/e2e minimos derivados del SDD en flujos de importacion.
- Backlog de Sprint 03 preparado.

## 10) Comentarios para principiantes

- **Vertical slice:** una funcionalidad completa de punta a punta (subida -> validacion -> respuesta).
- **Importacion asistida:** el sistema propone; el admin confirma.
- **E2E:** prueba que simula el recorrido real de un usuario en la app.
