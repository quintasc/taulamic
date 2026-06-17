# SDD-01 - Alcance MVP y Requisitos (v1)

## 1) Objetivo del documento

Definir con claridad que entra en el MVP, como debe comportarse el sistema y como validaremos que cada funcionalidad esta bien implementada.

## 2) Alcance del MVP

### 2.1 Entra en MVP

1. Crear evento y configurar mesas (cantidad, capacidad, nombre/numero).
2. Registrar invitados y estado de asistencia (confirmado, pendiente, no asiste).
3. Definir grupos/categorias personalizadas por evento.
4. Permitir afinidades e incompatibilidades entre invitados.
5. Gestionar acompanantes.
6. Registrar necesidades especiales:
   - alergias/intolerancias,
   - tipo de dieta (vegano, halal, etc.),
   - accesibilidad (silla de ruedas, necesidad de elevador, etc.).
7. Ejecutar calculo de distribucion automatica.
8. Permitir ajustes manuales por admin.
9. Aprobar version final de distribucion.
10. Programar fecha de visibilidad para invitados.
11. Generar documentos operativos descargables.

### 2.2 No entra en MVP

- App movil nativa.
- Integracion directa con software externo de salones.
- Facturacion/pagos online.
- Algoritmos avanzados multiobjetivo con explicacion matematica detallada.

## 3) Roles y permisos

- `Admin`: crea evento, define reglas, calcula, ajusta, aprueba y publica.
- `Invitado`: completa perfil, preferencias y consulta su informacion publicada.
- `Salon`: consulta documentos operativos habilitados por admin.

## 4) Entidades funcionales principales

- Evento
- Mesa
- Invitado
- Grupo/Categoria
- Preferencia (afinidad/incompatibilidad)
- Restriccion especial (salud, dieta, accesibilidad)
- Plan de asientos (versionado)
- Documento generado
- Configuracion de publicacion

## 5) Flujos funcionales clave

### Flujo A - Configuracion inicial

1. Admin crea evento.
2. Admin crea mesas y capacidades.
3. Admin crea grupos/categorias y reglas base.

### Flujo B - Captura de datos de invitados

1. Invitado completa grupos (maximo configurable).
2. Invitado define afinidades/incompatibilidades.
3. Invitado declara necesidades especiales y acompanante.

### Flujo C - Calculo y revision

1. Admin pulsa "calcular distribucion".
2. Sistema cambia a estado `Calculando`.
3. Sistema genera propuesta en estado `Propuesto`.
4. Admin revisa y ajusta manualmente.

### Flujo D - Aprobacion y publicacion

1. Admin aprueba version final.
2. Sistema bloquea esa version como `Aprobado`.
3. Admin define fecha/hora de publicacion para invitados.
4. Sistema publica automaticamente cuando llega la fecha configurada.

### Flujo E - Documentacion operativa

1. Tras aprobar, sistema genera documentos para salon/cocina.
2. Admin descarga documentos y comparte segun permisos.

## 6) Historias de usuario prioritarias y criterios de aceptacion

### HU-01 (Admin): configurar mesas

Como admin, quiero crear mesas con capacidad para poder iniciar la distribucion.

Criterios de aceptacion:

- No se permite capacidad 0 o negativa.
- Se puede editar capacidad antes de aprobar plan final.
- El sistema muestra capacidad total disponible del evento.

### HU-02 (Invitado): registrar perfil social y preferencias

Como invitado, quiero indicar grupos y preferencias para aumentar la probabilidad de una mesa afin.

Criterios de aceptacion:

- El maximo de grupos por invitado es configurable por evento.
- El invitado puede marcar afinidades e incompatibilidades.
- Datos sensibles quedan ocultos para otros invitados.

### HU-03 (Invitado): registrar necesidades especiales

Como invitado, quiero informar alergias, dieta y accesibilidad para evitar problemas en el evento.

Criterios de aceptacion:

- Alergias/intolerancias y dieta se guardan por invitado.
- Se permite marcar severidad y observaciones.
- Solo roles autorizados ven datos sensibles completos.

### HU-04 (Admin): calcular propuesta automatica

Como admin, quiero obtener una propuesta de asignacion para ahorrar tiempo.

Criterios de aceptacion:

- El sistema no bloquea la interfaz durante el calculo.
- El estado cambia `Borrador -> Calculando -> Propuesto`.
- El resultado cumple reglas duras siempre.

### HU-05 (Admin): ajustar manualmente

Como admin, quiero mover invitados manualmente para aplicar criterio humano final.

Criterios de aceptacion:

- Se puede mover invitado por interfaz visual.
- El sistema alerta si el cambio rompe una regla dura.
- Cambios manuales quedan registrados en auditoria.

### HU-06 (Admin): aprobar y versionar

Como admin, quiero aprobar una version final para cerrar el plan del evento.

Criterios de aceptacion:

- Solo un plan puede estar `Aprobado` por evento.
- Plan aprobado queda versionado y trazable.
- Recalculo posterior crea nueva version sin borrar historial.

### HU-07 (Admin): programar visibilidad de invitados

Como admin, quiero decidir cuando los invitados ven su mesa.

Criterios de aceptacion:

- Fecha de publicacion no puede superar fecha del evento.
- Antes de publicar, invitado no ve asignacion final.
- Al llegar fecha de publicacion, vista se habilita automaticamente.

### HU-08 (Salon): consultar documentos operativos

Como salon, quiero descargar listados utiles para preparar el servicio.

Criterios de aceptacion:

- Hay documento por mesa con nombres.
- Hay resumen cocina con dietas/alergias.
- Solo se muestran datos necesarios para operacion.

## 7) Reglas de negocio

### 7.1 Reglas duras (obligatorias)

- No superar capacidad de mesa.
- Respetar incompatibilidades obligatorias.
- Respetar restricciones de accesibilidad obligatorias.
- Respetar bloqueos manuales definidos por admin.
- No publicar despues de fecha del evento.

### 7.2 Reglas blandas (optimizables)

- Afinidad por grupos/categorias.
- Preferencias de compania.
- Preferencias de tipo de mesa (por ejemplo, solteros).
- Criterios adicionales del admin.

### 7.3 Prioridad de reglas

1. Seguridad y salud
2. Restricciones duras de evento
3. Criterios admin
4. Preferencias de invitados

## 8) Estados del plan de asientos

- `Borrador`
- `Calculando`
- `Propuesto`
- `Aprobado`
- `Publicado`

## 9) Requisitos no funcionales (objetivos iniciales)

- p95 API lectura < 250 ms.
- p95 API escritura < 500 ms.
- Interacciones UI con feedback en < 200 ms.
- Disponibilidad objetivo mensual >= 99.5% en MVP.
- Auditoria de acciones criticas.
- Copias de seguridad periodicas de base de datos.

## 10) Seguridad y privacidad

- Datos de "amores/odios" visibles solo para admins.
- Datos sensibles visibles por minimo privilegio necesario.
- Invitados no ven preferencias privadas de otros invitados.
- Registro de accesos a datos sensibles y descargas de documentos.

## 11) Documentos y publicacion

Documentos MVP:

- Plano de mesas con nombres.
- Listado por mesa para salon.
- Resumen de cocina (alergias, dietas y observaciones).
- Etiquetas imprimibles para soporte operativo.

Publicacion:

- Configurable por fecha/hora.
- Nunca posterior a fecha del evento.
- Debe respetar permisos por rol.

## 12) Punto Figma en el proceso SDD

Figma **no va al final**. En este proyecto va en paralelo a SDD-01, antes de pasar a desarrollo fuerte.

Orden recomendado:

1. SDD-00 (vision, estrategia, segmento y KPIs).
2. Borrador SDD-01 (funcionalidades y reglas).
3. Figma UX/UI inicial (flujos, wireframes y prototipo basico).
4. Ajuste final de SDD-01 con lo aprendido en Figma.
5. Inicio de implementacion.

Regla practica:

- Ninguna historia de usuario pasa a desarrollo si no tiene al menos flujo y wireframe asociados.

## 13) Riesgos principales y mitigacion

- Riesgo: reglas contradictorias -> Mitigacion: validaciones tempranas y mensajes claros.
- Riesgo: bajo completado de perfiles invitados -> Mitigacion: formularios simples y recordatorios.
- Riesgo: sobrecarga de calculo -> Mitigacion: worker asincrono y limites por evento.

## 14) Comentarios para principiantes

### Que es un criterio de aceptacion

Es una condicion concreta que dice cuando una funcionalidad esta bien hecha.

### Que es un requisito no funcional

Es una cualidad del sistema (seguridad, velocidad, estabilidad), no una pantalla concreta.

### Que es versionar un plan

Guardar historico de cambios para poder saber que se aprobo y cuando.
