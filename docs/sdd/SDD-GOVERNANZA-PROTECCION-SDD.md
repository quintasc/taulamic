# Gobernanza del SDD — Proteccion y no degradacion funcional

- Estado: **Regla obligatoria del proyecto**
- Alcance: producto, implementacion, tests, IA asistiva y revisiones tecnicas
- Fecha: 2026-06-17

## Regla obligatoria

El **SDD es la fuente de verdad funcional** del proyecto. Toda persona o herramienta (incluida IA) que desarrolle, corrija, refactorice o cree tests debe respetar estrictamente los requisitos funcionales, objetivos, criterios de aceptacion, prioridades y ponderaciones definidos en el SDD.

## Prohibiciones

No esta permitido modificar, eliminar, rebajar, reinterpretar ni sustituir ningun requisito funcional, objetivo, criterio de aceptacion, prioridad o ponderacion del SDD con el proposito de:

- hacer que los tests pasen, o
- simplificar la implementacion.

## Relacion SDD ↔ tests ↔ implementacion

- Los **tests deben derivarse del SDD** y servir para verificar que la implementacion cumple los requisitos definidos.
- Los **requisitos funcionales no deben adaptarse automaticamente a los tests**.
- Si un test falla, la **primera hipotesis** debe ser que la implementacion debe corregirse para cumplir el SDD, **no** que el SDD deba cambiarse.

**Principio rector:** los tests validan el SDD; no redefinen el SDD.

## Lo que si esta permitido sin cambiar alcance funcional

Se puede modificar codigo, mejorar arquitectura, refactorizar, crear tests, corregir errores y proponer mejoras tecnicas, siempre que **no se altere el alcance funcional aprobado** sin autorizacion expresa.

## Protocolo ante conflicto o ambiguedad

Si se detecta una contradiccion, ambiguedad, error de especificacion o conflicto entre el SDD, los tests y la implementacion, se debe **detenerse antes de aplicar cambios funcionales** y explicar claramente:

1. que requisito, test o parte del codigo entra en conflicto;
2. por que existe el problema;
3. que alternativas de solucion se proponen;
4. que impacto tendria cada alternativa sobre el alcance funcional, los tests y la implementacion.

Solo despues de una **aprobacion manual explicita** podra modificarse el SDD, los criterios de aceptacion, las prioridades, las ponderaciones o el comportamiento funcional esperado.

La validacion tecnica (tests, cobertura y CI) se rige por `docs/agile/politica-validacion-tests-y-cobertura.md`.

## Documentos SDD de referencia

- Vision y estrategia: `SDD-00-vision-y-estrategia.md`
- Alcance MVP y requisitos: `SDD-01-borrador-mvp.md` y anexos `SDD-01A` a `SDD-01E`
- Alineacion piloto (jun 2026): `SDD-PILOTO-alineacion-y-huecos.md`
- Backlog ejecutable: `SDD-02-backlog-inicial.md`
- IA asistiva: `SDD-03-ia-asistiva-priorizada.md`

Las decisiones tecnicas viven en `docs/adr/` y **no sustituyen** requisitos funcionales del SDD salvo que el SDD o un ADR explicitamente lo indiquen y exista aprobacion del cambio funcional cuando aplique.

## Comentarios para principiantes

- **Fuente de verdad:** el documento que manda cuando hay duda sobre que debe hacer el producto.
- **Degradacion funcional:** entregar menos de lo especificado para “cerrar rapido” un ticket o un test.
- **Aprobacion explicita:** decision consciente de una persona responsable, no un cambio silencioso en codigo o tests.
