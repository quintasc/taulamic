# ADR-012 - Modo de control de preferencias y regla de acompanantes

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

No todos los eventos requieren el mismo nivel de autonomia de invitados.
En algunos casos, los anfitriones quieren control total de afinidades/incompatibilidades.

Ademas, cuando existen acompanantes, la expectativa natural es sentarlos juntos salvo excepcion.

## Decision

Se define por evento un `modo_control_preferencias` con dos valores:

1. `colaborativo`
2. `anfitrion_exclusivo`

Tambien se define regla base:

- acompanantes juntos por defecto, salvo indicacion explicita en contra.

## Reglas operativas

- En modo `colaborativo`, invitados pueden aportar preferencias de asiento segun permisos del evento.
- En modo `anfitrion_exclusivo`, solo admins crean/editan afinidades e incompatibilidades.
- El cambio de modo queda auditado.
- Si acompanantes no pueden sentarse juntos por conflicto de reglas duras, el sistema debe explicarlo.

## Motivos de la decision

- Da flexibilidad operativa segun estilo de organizacion del evento.
- Reduce conflictos en eventos con criterio centralizado.
- Mantiene comportamiento intuitivo para acompanantes.

## Consecuencias positivas

- Mejor adaptacion del producto a distintos perfiles de admin.
- Menor ambiguedad sobre quien controla reglas sociales.

## Consecuencias negativas

- Mayor complejidad de permisos y estados UI.
- Requiere mensajes claros para evitar confusion del invitado.

## Condiciones para revisar esta decision

Reevaluar cuando:

- usuarios pidan modo hibrido mas granular por tipo de preferencia,
- o aparezcan necesidades legales/culturales especificas por pais.

## Comentarios para principiantes

- **Modo colaborativo:** invitados tambien participan en preferencias.
- **Modo anfitrion_exclusivo:** solo organizadores controlan preferencias.
- **Excepcion explicita:** un caso concreto marcado manualmente para romper la regla por defecto.
