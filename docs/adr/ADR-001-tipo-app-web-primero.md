# ADR-001 - Tipo de aplicacion inicial

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

El producto debe salir rapido al mercado, controlar costes y mantener buena experiencia de uso.
La app tendra roles distintos (admin, invitado, salon) y necesitara iterar funcionalidades en poco tiempo.

## Opciones consideradas

### Opcion A: Web responsive primero

- Una app web que funcione bien en movil y escritorio.

### Opcion B: App movil nativa primero

- Android/iOS como canal principal de lanzamiento.

### Opcion C: Web + movil nativa desde el dia 1

- Lanzar ambos canales al mismo tiempo.

## Decision

Se elige **Opcion A: web responsive primero**.

## Motivos de la decision

- Menor coste inicial de desarrollo y mantenimiento.
- Menor tiempo de salida al mercado.
- Mayor velocidad para validar producto con usuarios reales.
- Menor complejidad operativa para un equipo pequeno.
- Permite anadir app movil nativa mas adelante sin bloquear el MVP.

## Consecuencias positivas

- Time-to-market mas rapido.
- Menos riesgo al inicio.
- Posibilidad de iterar con frecuencia en base a feedback real.

## Consecuencias negativas

- Algunas capacidades nativas moviles avanzadas no estaran disponibles de inicio.
- Puede requerirse app nativa en fase posterior si el uso movil recurrente crece mucho.

## Condiciones para revisar esta decision

Reevaluar cuando ocurra alguno de estos escenarios:

- Mas del 70% del uso sea movil intensivo y continuo.
- Se necesiten funciones nativas avanzadas (offline complejo, integraciones nativas especificas).
- Existan restricciones comerciales o de distribucion que obliguen a tener app en stores.

## Comentarios para principiantes

- **ADR:** documento corto para dejar clara una decision tecnica.
- **Time-to-market:** tiempo desde idea hasta primera version util en manos de usuarios.
- **Web responsive:** una misma web adaptada a movil, tablet y escritorio.
