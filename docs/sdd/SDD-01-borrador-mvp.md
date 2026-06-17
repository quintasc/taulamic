# SDD-01 - Alcance MVP y Requisitos (v1)

## 1) Objetivo del documento

Definir con claridad que entra en el MVP, como debe comportarse el sistema y como validaremos que cada funcionalidad esta bien implementada.

## 2) Alcance del MVP

### 2.1 Entra en MVP

1. Crear evento y configurar mesas (cantidad, capacidad, nombre/numero, forma y disposicion de asientos).
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
12. Conservar ranking Top-K de mejores distribuciones validas antes de aprobar.
13. Crear y enviar invitaciones digitales a invitados (individual o masivo).
14. Registrar y gestionar confirmacion de asistencia (RSVP).
15. Importar plano del salon desde imagen o PDF para autoconfigurar mesas (con validacion manual).
16. Precargar invitados desde Excel estandar descargable con validacion de datos.
17. Permitir modo de control de preferencias: colaborativo (invitados) o exclusivo de anfitriones.
18. Aplicar regla de acompanantes juntos por defecto, con excepcion explicita.

### 2.2 No entra en MVP

- App movil nativa.
- Integracion directa con software externo de salones.
- Facturacion/pagos online.
- Algoritmos avanzados multiobjetivo con explicacion matematica detallada.

## 3) Roles y permisos

- `Admin`: crea evento, define reglas, decide modo de preferencias, calcula, ajusta, aprueba y publica.
- `Invitado`: completa perfil y consulta su informacion publicada; puede editar preferencias solo en modo colaborativo.
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
- Forma de mesa / topologia de asientos
- Plano de salon importado
- Invitacion
- RSVP
- Plantilla de mensaje
- Lote de precarga de invitados
- Plantilla Excel de invitados
- Modo de control de preferencias

## 5) Flujos funcionales clave

### Flujo A - Configuracion inicial

1. Admin crea evento.
2. Admin crea mesas, capacidades y forma (ejemplo: redonda, rectangular, imperial, ovalada).
3. Admin crea grupos/categorias y reglas base.

### Flujo B - Captura de datos de invitados

1. Invitado completa datos base y estado de acompanante.
2. En modo `colaborativo`, invitado define afinidades/incompatibilidades (segun reglas del evento).
3. En modo `anfitrion_exclusivo`, preferencias de asiento solo se gestionan por admin.
4. Invitado declara necesidades especiales permitidas por rol.

### Flujo C - Calculo y revision

1. Admin pulsa "calcular distribucion".
2. Sistema cambia a estado `Calculando`.
3. Sistema genera ranking Top-K de candidatas en estado `Propuesto`.
4. Admin compara candidatas en vista rapida y visual.
5. Admin selecciona candidata base y ajusta manualmente si hace falta.

### Flujo D - Aprobacion y publicacion

1. Admin aprueba version final.
2. Sistema bloquea esa version como `Aprobado`.
3. Admin define fecha/hora de publicacion para invitados.
4. Sistema publica automaticamente cuando llega la fecha configurada.

### Flujo E - Documentacion operativa

1. Tras aprobar, sistema genera documentos para salon/cocina.
2. Admin descarga documentos y comparte segun permisos.

### Flujo F - Invitaciones y confirmacion de asistencia (RSVP)

1. Admin selecciona invitados objetivo (todos, grupo o individuales).
2. Admin envia invitacion con plantilla basica.
3. Invitado responde asistencia (`si`, `no`, `pendiente`).
4. Sistema actualiza estado de asistencia en tiempo real para el evento.
5. Admin puede reenviar o recordar invitacion a pendientes.

### Flujo G - Importacion de plano del salon (imagen/PDF)

1. Admin sube imagen o PDF del plano del salon.
2. Sistema detecta mesas candidatas, forma y capacidad estimada.
3. Sistema muestra propuesta con nivel de confianza por mesa.
4. Admin corrige manualmente y confirma la configuracion final.
5. Evento queda configurado para continuar con invitados y asignacion.

### Flujo H - Precarga de invitados por Excel

1. Admin descarga plantilla Excel oficial de invitados.
2. Admin completa plantilla con datos base y preclasificacion.
3. Admin sube archivo Excel completo.
4. Sistema valida formato y datos (errores y advertencias).
5. Sistema crea invitados y categorias; mapea observaciones a restricciones sugeridas.
6. Admin revisa sugerencias de restricciones y confirma aplicacion.

### Flujo I - Modo de control de preferencias

1. Admin define modo del evento: `colaborativo` o `anfitrion_exclusivo`.
2. Sistema aplica permisos segun modo:
   - colaborativo: invitados pueden indicar preferencias de asiento.
   - anfitrion_exclusivo: solo admins crean/editan preferencias.
3. Regla por defecto de acompanantes:
   - si vienen acompanados, se sientan juntos por defecto.
   - puede romperse solo si existe indicacion explicita en contra por regla del evento o accion admin.

## 6) Historias de usuario prioritarias y criterios de aceptacion

### HU-01 (Admin): configurar mesas

Como admin, quiero crear mesas con capacidad para poder iniciar la distribucion.

Criterios de aceptacion:

- No se permite capacidad 0 o negativa.
- Se puede editar capacidad antes de aprobar plan final.
- El sistema muestra capacidad total disponible del evento.
- El admin debe poder escoger forma de mesa desde catalogo configurable.
- El sistema debe representar vecindad de asientos en funcion de la forma elegida.
- Cambiar la forma de mesa recalcula proximidades para el motor de asignacion.

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

### HU-09 (Admin): comparar mejores candidatas antes de aprobar

Como admin, quiero ver varias propuestas buenas para elegir la mejor antes de cerrar el plan.

Criterios de aceptacion:

- El sistema guarda Top-K candidatas validas por score global.
- K es configurable por evento (valor por defecto: 3).
- Solo se incluyen candidatas sin violaciones de reglas duras.
- La comparacion visual debe mostrar: score global, score por criterio y alertas clave por candidata.
- La comparacion visual debe resaltar diferencias entre candidatas sin requerir abrir cada mesa manualmente.
- El admin puede seleccionar una candidata para aprobarla o editarla en maximo 3 acciones.

### HU-10 (Admin): enviar invitaciones

Como admin, quiero enviar invitaciones de forma simple para iniciar la captacion de respuestas.

Criterios de aceptacion:

- Debe ser posible enviar invitacion individual o masiva.
- Debe existir plantilla base editable (asunto y cuerpo corto).
- El sistema registra fecha/hora y estado de envio por invitado.

### HU-11 (Invitado): confirmar asistencia (RSVP)

Como invitado, quiero confirmar asistencia de forma rapida para no perder tiempo.

Criterios de aceptacion:

- La respuesta se completa en maximo 2 pasos (`si/no` + confirmacion opcional).
- El estado se guarda como `si`, `no` o `pendiente`.
- El admin ve el cambio actualizado sin recargar todo el evento.

### HU-12 (Admin): importar plano y autoconfigurar mesas

Como admin, quiero subir un plano del salon para reducir el trabajo manual de configuracion.

Criterios de aceptacion:

- El sistema acepta formatos comunes de entrada (JPG, PNG y PDF).
- El sistema propone numero de mesas, forma y capacidad estimada por mesa.
- Cada mesa detectada muestra nivel de confianza de deteccion.
- El admin puede editar, eliminar o crear mesas antes de confirmar.
- La confirmacion manual del admin es obligatoria antes de guardar la configuracion final.

### HU-13 (Admin): descargar plantilla Excel estandar de invitados

Como admin, quiero descargar una plantilla unica para cargar invitados sin errores de formato.

Criterios de aceptacion:

- Debe existir plantilla descargable en formato `.xlsx`.
- La plantilla debe incluir columnas obligatorias: nombre, correo, telefono.
- La plantilla debe incluir columnas opcionales: direccion, categoria_1, categoria_2, observaciones.
- La plantilla debe incluir instrucciones breves de uso para principiantes.

### HU-14 (Admin): subir Excel para precarga masiva de invitados

Como admin, quiero subir un Excel para crear invitados en bloque y ahorrar trabajo manual.

Criterios de aceptacion:

- El sistema acepta archivo `.xlsx` con estructura de plantilla oficial.
- El sistema valida duplicados, campos obligatorios y formato de correo/telefono.
- El sistema muestra resumen de importacion (nuevos, actualizados, rechazados).
- Errores por fila deben mostrarse de forma clara para poder corregir y reintentar.

### HU-15 (Admin): mapear observaciones a restricciones del sistema

Como admin, quiero que ciertas observaciones se conviertan en restricciones sugeridas para acelerar la configuracion.

Criterios de aceptacion:

- El sistema propone mapeos de observaciones hacia restricciones conocidas (amor, odio, intolerancia, etc.).
- Las sugerencias nunca se aplican automaticamente sin revision del admin.
- El admin puede aceptar, rechazar o editar cada sugerencia antes de confirmar.
- El origen de cada restriccion debe quedar trazado (manual o sugerida por importacion).

### HU-16 (Admin): definir modo de control de preferencias

Como admin, quiero elegir si las preferencias las aportan invitados o solo anfitriones, para adaptar el nivel de control del evento.

Criterios de aceptacion:

- El evento permite seleccionar `colaborativo` o `anfitrion_exclusivo`.
- En modo colaborativo, invitados autorizados pueden editar preferencias de asiento.
- En modo anfitrion_exclusivo, invitados no pueden editar afinidades/incompatibilidades.
- El cambio de modo queda auditado con fecha y usuario admin.

### HU-17 (Regla de acompanantes): sentar juntos por defecto

Como organizador, quiero que acompanantes se sienten juntos por defecto, salvo excepcion explicita.

Criterios de aceptacion:

- Si dos personas vienen acompanadas, el motor prioriza misma mesa y posicion cercana.
- La regla puede desactivarse para un caso concreto por admin o por campo explicito en datos de evento.
- El sistema debe explicar cuando no puede cumplir la regla (por restricciones duras de capacidad o incompatibilidad).

## 7) Reglas de negocio

### 7.1 Reglas duras (obligatorias)

- No superar capacidad de mesa.
- No asignar posiciones de asiento invalidas para la forma de mesa definida.
- Acompanantes deben sentarse juntos por defecto, salvo excepcion explicita configurada.
- Respetar incompatibilidades obligatorias.
- Respetar restricciones de accesibilidad obligatorias.
- Respetar bloqueos manuales definidos por admin.
- No publicar despues de fecha del evento.
- En modo `anfitrion_exclusivo`, invitados no pueden modificar preferencias de asiento.

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
- Pantalla de comparacion de candidatas con carga objetivo p95 < 700 ms.
- Comparacion de 3 candidatas debe poder completarse en menos de 2 minutos por un admin novato.
- Flujo RSVP completado por invitado en <= 45 segundos objetivo.
- Flujo de envio masivo de invitaciones por admin en <= 3 minutos para 150 invitados.
- Importacion y preconfiguracion de plano en <= 60 segundos objetivo para tamano medio.
- Error de deteccion no debe bloquear el flujo: siempre debe existir correccion manual completa.
- Importacion de 500 invitados desde Excel en <= 90 segundos objetivo.
- Validacion de archivo debe devolver reporte legible por fila en <= 15 segundos objetivo.
- Cambio de modo de control (colaborativo/exclusivo) reflejado en permisos en <= 2 segundos objetivo.

## 10) Seguridad y privacidad

- Datos de "amores/odios" visibles solo para admins.
- Datos sensibles visibles por minimo privilegio necesario.
- Invitados no ven preferencias privadas de otros invitados.
- Registro de accesos a datos sensibles y descargas de documentos.
- Datos de contacto y direccion tratados como datos personales con controles de acceso por rol.
- En modo `anfitrion_exclusivo`, permisos de edicion de preferencias quedan restringidos a admins.

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

## 14) Patrones de diseno a contemplar en MVP

Patrones recomendados:

- **Strategy:** para cambiar estrategia de asignacion sin romper el dominio.
- **Specification:** para componer reglas duras y blandas de forma mantenible.
- **State:** para transiciones seguras del plan (`Borrador` a `Publicado`).
- **Command + cola:** para calculo y documentos en segundo plano.
- **Repository:** para desacoplar dominio de persistencia.
- **Factory:** para generadores de documentos por tipo.
- **Policy/RBAC:** para permisos por rol y proteccion de datos sensibles.

Regla de aplicacion:

- Aplicar estos patrones donde reduzcan complejidad real.
- Evitar sobreingenieria en fase MVP.

Referencia:

- `docs/arquitectura/patrones-diseno-mvp.md`
- `docs/adr/ADR-004-patrones-diseno-mvp.md`

## 15) Documentacion de API (OpenAPI/Swagger en NestJS)

Decision:

- Estandar de API con OpenAPI 3 usando `@nestjs/swagger`.

Salida:

- UI interactiva en `/api/docs`
- Especificacion JSON en `/api-json`

Reglas minimas:

- Endpoints con `@ApiTags`, `@ApiOperation` y `@ApiResponse`.
- DTOs publicos con `@ApiProperty`.
- Endpoints protegidos documentan esquema Bearer JWT.
- Cambios breaking requieren versionado de API.

Referencia:

- `docs/api/openapi-nestjs-guia.md`
- `docs/adr/ADR-005-documentacion-api-openapi-nestjs.md`

## 16) Estrategia del motor de optimizacion (NP-hard)

Decision:

- Usar estrategia hibrida basada en optimizacion clasica, no IA generativa como motor principal.

Enfoque operativo:

1. Solucion inicial factible con heuristica constructiva.
2. Mejora por busqueda local + simulated annealing.
3. Refinamiento exacto opcional (Branch and Bound o CP-SAT) segun tamano/tiempo.

Reglas de producto:

- Regla dura violada = solucion invalida.
- Si el tiempo limite expira, devolver mejor solucion valida encontrada.
- Registrar score y metadatos del calculo para auditoria y mejora continua.
- Mantener ranking Top-K de soluciones validas hasta la aprobacion (K por defecto: 3, parametrizable).
- Calcular afinidades/incompatibilidades considerando topologia real de mesa (adyacencia, frente y mismo lateral segun forma).

Referencia:

- `docs/arquitectura/estudio-estrategia-optimizacion-asientos.md`
- `docs/adr/ADR-006-estrategia-optimizacion-motor-asignacion.md`
- `docs/adr/ADR-007-top-k-soluciones-candidatas.md`
- `docs/adr/ADR-012-modo-control-preferencias-y-regla-acompanantes.md`
- `docs/arquitectura/decision-motor-para-principiantes.md`
- `docs/sdd/SDD-01B-comparacion-visual-candidatas.md`

## 17) Benchmark y estilo UX/UI

Referencias de mercado (como inspiracion, no copia):

- PerfectTablePlan
- Planning Pod
- Prismm

Direccion visual del producto:

- Estilo sobrio y elegante.
- Interfaz poco cargada y de lectura limpia.
- Tonos alegres no distractores (baja saturacion, contraste comodo).
- Interacciones amables, directas y de baja friccion.

Principios de baja friccion:

- Configuracion de evento en pasos guiados.
- Respuesta de invitado en el menor numero de acciones posible.
- Mensajes claros en lenguaje no tecnico.

Referencia:

- `docs/sdd/SDD-01C-principios-estilo-y-baja-friccion.md`
- `docs/sdd/SDD-01D-importacion-plano-salon.md`
- `docs/sdd/SDD-01E-precarga-invitados-excel.md`

## 18) Comentarios para principiantes

### Que es un criterio de aceptacion

Es una condicion concreta que dice cuando una funcionalidad esta bien hecha.

### Que es un requisito no funcional

Es una cualidad del sistema (seguridad, velocidad, estabilidad), no una pantalla concreta.

### Que es versionar un plan

Guardar historico de cambios para poder saber que se aprobo y cuando.
