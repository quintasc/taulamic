# ADR-002 - Arquitectura inicial

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

La aplicacion necesita:

- operaciones normales de CRUD (eventos, mesas, invitados),
- calculo de distribucion de asientos con reglas y optimizacion,
- generacion de documentos (listados, etiquetas, resumen cocina),
- buena respuesta de interfaz sin bloqueos.

El calculo de distribucion puede tardar mas que una accion normal de formulario.

## Opciones consideradas

### Opcion A: Monolito modular + worker de calculo

- Un backend principal organizado por modulos.
- Un proceso worker para tareas pesadas usando cola.

### Opcion B: Microservicios desde el inicio

- Varios servicios separados para cada parte del dominio.

### Opcion C: Monolito sin worker

- Todo se procesa en el mismo flujo de peticion-respuesta.

## Decision

Se elige **Opcion A: monolito modular + worker de calculo en segundo plano**.

## Diseno elegido (alto nivel)

- **Frontend web:** interfaz para admins, invitados y salon.
- **API backend:** reglas de negocio y control de acceso.
- **Base de datos:** persistencia de entidades y resultados.
- **Cola de trabajos:** encola calculos y documentos.
- **Worker:** ejecuta calculo de distribucion y generacion de documentos.

## Motivos de la decision

- Evita bloqueos en la experiencia de usuario durante calculos largos.
- Mantiene complejidad controlada para fase inicial.
- Permite escalar de forma gradual sin rehacer todo el sistema.
- Facilita trazabilidad de estados: "borrador", "calculando", "propuesto", "aprobado".

## Consecuencias positivas

- Mejor UX: respuestas rapidas en acciones de interfaz.
- Mejor concurrencia: tareas pesadas no compiten con peticiones normales.
- Menor coste operativo que microservicios al inicio.

## Consecuencias negativas

- Introduce conceptos asincronos (cola, reintentos, estados de job).
- Requiere buena observabilidad para entender fallos de jobs.

## Condiciones para revisar esta decision

Reevaluar cuando:

- el volumen de eventos concurrentes crezca mucho,
- el equipo aumente y necesite despliegues independientes por dominio,
- o existan cuellos de botella persistentes en el backend principal.

## Comentarios para principiantes

- **Monolito modular:** una sola app backend, pero bien ordenada por modulos.
- **Worker:** proceso aparte que hace trabajo pesado sin bloquear la app.
- **Asincrono:** no esperas resultado inmediato en pantalla; se procesa en segundo plano.
