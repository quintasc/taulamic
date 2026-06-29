# ADR-022 - Override manual HU-05 frente a reglas duras

- Estado: Aceptado
- Fecha: 2026-06-21

## Contexto

SDD-01 §7.1 lista «acompañantes juntos» como regla dura. HU-05 permite ajuste manual con «criterio humano final». En piloto julio el modo activo es `anfitrion_exclusivo` (ADR-012): el organizador controla preferencias.

La implementación inicial de HU-05 bloqueaba (409) cualquier separación de acompañantes en assign/move, igual que el motor. Eso impide el override humano que HU-05 describe.

## Decision

1. **Motor automatico (HU-04):** las reglas duras §7.1 siguen siendo obligatorias; el motor no propone violaciones.
2. **Mutaciones manuales HU-05** (`draft` unicamente):
   - **Bloquear:** capacidad mesa, incompatibilidades obligatorias, propuesta confirmada.
   - **Advertir y permitir:** separacion de acompañantes sin excepcion Excel `separar_acompanante`.
3. Toda separacion advertida se registra en auditoria con `companionSeparationWarning: true`.
4. Excel `separar_acompanante` sigue siendo la excepcion estructural del grupo (sin warning repetitivo).

## Motivos

- Alinea HU-05 (criterio humano) con §7.1 (expectativa de ir juntos) sin eliminar la regla para el motor.
- Respeta anfitrion exclusivo: decision final del admin en borrador.
- Mantiene trazabilidad via auditoria.

## Consecuencias

- API devuelve `manualWarnings` efimeros en mutaciones manuales.
- UI distingue `Alert` warning (no bloqueante) de error (bloqueante).
- Tests e2e de separacion de pareja pasan a esperar 200 + warning, no 409.

## Condiciones de revision

- Si negocio exige bloqueo tambien en manual salvo confirmacion explicita (modal), reevaluar RF-HU05-05.5.
- Fase C (asientos S1…Sn) puede anadir reglas por vecindad de silla (ADR-009).

## Referencias

- `SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md`
- ADR-012
