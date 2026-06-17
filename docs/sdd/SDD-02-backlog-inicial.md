# SDD-02 - Backlog Inicial (MVP)

## 1) Objetivo

Traducir SDD-01 en trabajo ejecutable en GitHub Issues, priorizado por valor y riesgo.

## 2) Epicas MVP

### EP-01 - Configuracion del evento y mesas

- HU-01 Configurar evento y mesas.
- HU-02 Gestion de capacidad y validaciones.

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

## 3) Priorizacion sugerida (orden de ejecucion)

1. EP-01
2. EP-02
3. EP-07
4. EP-03
5. EP-04
6. EP-05
7. EP-06

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
- actualiza documentacion afectada,
- y queda vinculada al commit/PR correspondiente.

## 6) Comentarios para principiantes

- **Backlog:** lista priorizada de trabajo.
- **Epica:** bloque grande de funcionalidad.
- **DoR:** condiciones para empezar bien una tarea.
- **DoD:** condiciones para cerrar bien una tarea.
