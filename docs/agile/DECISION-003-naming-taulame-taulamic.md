# DECISION-003 - Naming: Taulame (piloto) y Taulamic (candidato comercial)

- Estado: **Aceptada**
- Fecha: 2026-06-20
- Decisor: Carmen Quintas Ramirez (product owner)

## Contexto

Durante Sprint 02 se evaluaron nombres alternativos al producto canonico **Taulame** (SDD-00, repo `quintasc/taulame`):

| Nombre | Conclusion breve |
|--------|------------------|
| Sittio | Descartado (dominios ocupados, sector SaaS activo) |
| Affinis | Descartado (colisiones de marca en ES) |
| Kune | Descartado (agencias de eventos en ES con mismo nombre) |
| Kumi | Descartado (`kumi.es` ocupado, ruido SaaS global) |
| **Taulamic** | Candidato fuerte: *taula* + *amic* (mesa / amigos) |

Comprobacion de dominio (RDAP Verisign, 2026-06-20):

- `taulamic.com` — **disponible** (404 en registro .com)
- `taulame.com` — **disponible** (404 en registro .com)

Riesgo identificado para Taulamic: similitud fonetica con **Talismatic** (RRHH/IA) y **Talmatic** (staffing IT). El product owner **asume este riesgo** por considerar las marcas suficientemente distintas en sector y escritura.

## Decision

1. **MVP julio (piloto, hasta 2026-07-31):** el nombre operativo sigue siendo **Taulame** en SDD, codigo, repo GitHub, issues y documentacion. **No hay rename** antes del piloto.
2. **Taulamic** queda registrado como **candidato preferido de marca comercial** para una posible transicion **post-piloto** (agosto 2026+), sujeta a registro de dominio/marca y decision explicita posterior.
3. La evaluacion de nombres **no modifica** requisitos funcionales del SDD ni el alcance del piloto (DECISION-002).

## Acciones recomendadas (no bloqueantes del piloto)

- Registrar `taulamic.com` cuando se confirme rebrand (dominio libre a 2026-06-20; reverificar antes de pagar).
- Consulta de marca OEPM/UE (clases 9, 35, 42) antes de rebrand publico.
- Comprobar `taulamic.es` si el mercado inicial sigue siendo Espana.

## Consecuencias

- El equipo evita coste de rename durante el sprint critico hacia julio.
- Queda trazabilidad de la preferencia por Taulamic y del riesgo fonetico asumido.
- Cualquier rename futuro requerira ADR/DECISION de seguimiento y actualizacion coordinada de SDD, repo y dominios.

## Referencias

- SDD-00 (`taulame.com` objetivo historico)
- Conversacion de evaluacion: Kune, Kumi, Taulamic (2026-06)
