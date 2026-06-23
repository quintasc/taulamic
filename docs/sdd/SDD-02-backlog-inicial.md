# SDD-02 - Backlog Inicial (MVP)

## 1) Objetivo

Traducir SDD-01 en trabajo ejecutable en GitHub Issues, priorizado por valor y riesgo.

## 2) Epicas MVP

### EP-01 - Configuracion del evento y mesas

- HU-01 Configurar evento y mesas.
- HU-02 Gestion de capacidad y validaciones.
- HU-29 Configurar forma de mesa y topologia de asientos (adyacencia/proximidad).

### EP-02 - Captura de datos de invitados

- HU-03 Perfil social (grupos, afinidades, incompatibilidades).
- HU-04 Acompanantes y restricciones asociadas.
- HU-05 Necesidades especiales (alergias, dieta, accesibilidad).

### EP-03 - Motor de distribucion

- HU-06 Ejecutar calculo automatico asincrono.
- HU-07 Aplicar reglas duras y blandas con prioridad.

### EP-04 - Revision y aprobacion

- HU-08 Ajuste manual en tablero admin.
- HU-09 Aprobacion y versionado del plan.

### EP-05 - Publicacion y documentos

- HU-10 Programar visibilidad para invitados.
- HU-11 Generar documentos para salon/cocina.

### EP-06 - Seguridad y auditoria

- HU-12 Roles, permisos y proteccion de datos sensibles.
- HU-13 Registro de acciones criticas.

### EP-07 - Contrato API y documentacion OpenAPI

- HU-14 Publicar documentacion API en `/api/docs`.
- HU-15 Mantener especificacion OpenAPI versionada y alineada con DTOs.
- HU-16 Definir versionado de API y politica de cambios breaking.

### EP-08 - Estrategia de optimizacion y benchmark del motor

- HU-17 Definir funcion objetivo y pesos iniciales de satisfaccion.
- HU-18 Implementar heuristica + mejora metaheuristica en worker.
- HU-19 Definir benchmark por tamano de evento y KPIs de rendimiento/calidad.
- HU-20 Evaluar uso de refinamiento exacto (Branch and Bound o CP-SAT) por umbrales.
- HU-21 Guardar y exponer Top-K candidatas validas (K configurable, default 3).
- HU-22 Implementar comparador visual rapido de candidatas para decision admin.
- HU-30 Incorporar geometria de mesa en score de cercania (lado/frente/distancia relativa).

### EP-09 - Invitaciones y confirmacion de asistencia (RSVP)

- HU-23 Enviar invitaciones individuales y masivas.
- HU-24 Gestionar estado RSVP (`si`, `no`, `pendiente`) en tiempo real.
- HU-25 Reenviar recordatorios a invitados pendientes.

### EP-10 - UX/UI sobria y de baja friccion

- HU-26 Definir guia visual (sobria, elegante, no recargada).
- HU-27 Validar flujo de invitado con respuesta en <= 45 segundos.
- HU-28 Validar flujo admin de parametrizacion y envio rapido.

### EP-11 - Plano del salon (espacial + API legacy deteccion mesas)

> **Actualizado 2026-06-23 (`ADR-016`):** producto prioriza **Fase A** (espacio: forma, medidas) y **Fase B** (mesas post-distribucion). Las HU siguientes describen la API legacy de deteccion de mesas (backend EP-11); **no** son el camino UI principal del piloto.

- HU-31 Subir imagen/PDF del plano del salon *(legacy / fondo opcional futuro)*.
- HU-32 Detectar mesas, forma y capacidad estimada con nivel de confianza *(API legacy)*.
- HU-33 Corregir manualmente detecciones y confirmar configuracion final *(UI «Corregir plano» suspendida)*.

**Epica UI vigente (piloto):** HU-12 plano espacial — ver `SDD-01D`, `ADR-016`.

### EP-12 - Precarga de invitados por Excel estandar

- HU-34 Descargar plantilla oficial de invitados.
- HU-35 Subir `.xlsx` y validar filas con reporte de errores.
- HU-36 Crear/actualizar invitados en lote con preclasificacion por categorias.
- HU-37 Sugerir restricciones desde observaciones y requerir confirmacion manual.

### EP-13 - Gobernanza de preferencias y regla de acompanantes

- HU-38 Definir modo de control de preferencias por evento (colaborativo/anfitrion_exclusivo).
- HU-39 Aplicar permisos de edicion de preferencias segun modo seleccionado.
- HU-40 Aplicar regla de acompanantes juntos por defecto con excepciones explicitas.

### EP-14 - IA asistiva para operaciones de evento

- HU-41 Detectar **contorno del salon** o mesas con ayuda de IA *(mesas: legacy; ver `ADR-016`)* en importacion de plano.
- HU-42 Sugerir restricciones estructuradas desde observaciones de Excel.
- HU-43 Generar explicaciones legibles de diferencias entre candidatas.
- HU-44 Asistir redaccion de invitaciones y recordatorios.

### EP-15 - Benchmark comparativo de algoritmos (GA/SA/CP-SAT)

- HU-45 Definir protocolo benchmark reproducible por escenarios.
- HU-46 Medir calidad, tiempo y diversidad Top-K por algoritmo.
- HU-47 Decidir adopcion de GA segun umbrales definidos.

## 3) Priorizacion sugerida (orden de ejecucion)

1. EP-01
2. EP-11
3. EP-12
4. EP-13
5. EP-02
6. EP-09
7. EP-10
8. EP-14
9. EP-08
10. EP-15
11. EP-07
12. EP-03
13. EP-04
14. EP-05
15. EP-06

## 4) Definicion de Ready (DoR) para empezar una Issue

Una Issue esta lista para desarrollo si tiene:

- descripcion funcional clara,
- criterios de aceptacion,
- impacto en roles identificado,
- referencia a SDD-01 y, si aplica, flujo en Figma.

## 5) Definicion de Done (DoD) para cerrar una Issue

Una Issue se considera terminada cuando:

- cumple criterios de aceptacion,
- tiene pruebas minimas definidas,
- cumple la politica de validacion en `docs/agile/politica-validacion-tests-y-cobertura.md`,
- actualiza documentacion afectada,
- y queda vinculada al commit/PR correspondiente.

## 6) Comentarios para principiantes

- **Backlog:** lista priorizada de trabajo.
- **Epica:** bloque grande de funcionalidad.
- **DoR:** condiciones para empezar bien una tarea.
- **DoD:** condiciones para cerrar bien una tarea.
