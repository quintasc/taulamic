# ADR-004 - Patrones de diseno para MVP

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

El dominio de asignacion de mesas tiene reglas complejas, estados y procesamiento asincrono.
Sin patrones claros, el codigo puede volverse dificil de mantener rapidamente.

## Decision

Adoptar en MVP los siguientes patrones:

1. **Strategy** para motor de asignacion.
2. **Specification** para reglas duras y blandas.
3. **State** para ciclo de vida del plan de asientos.
4. **Command + cola (producer/consumer)** para calculo y documentos.
5. **Repository** para acceso a datos desacoplado.
6. **Factory** para generadores de documentos.
7. **Policy/RBAC** para permisos por rol.

## Motivos de la decision

- Separar reglas de negocio del framework.
- Facilitar cambios futuros sin reescritura grande.
- Mantener trazabilidad de estados y operaciones criticas.
- Mejorar testabilidad por componentes bien aislados.

## Alcance MVP

Se aplican de forma pragmatica, sin sobreingenieria.
No se adopta CQRS completo ni microservicios por defecto en esta fase.

## Consecuencias positivas

- Codigo mas mantenible.
- Menor acoplamiento entre modulos.
- Menor riesgo de regresiones en logica de negocio.

## Consecuencias negativas

- Curva de aprendizaje inicial para equipo principiante.
- Requiere disciplina de arquitectura y convenciones de codigo.

## Condiciones para revisar esta decision

Reevaluar cuando:

- cambie de forma fuerte el volumen o complejidad del dominio,
- cambie el tamano del equipo,
- o aparezca necesidad real de separar servicios.

## Comentarios para principiantes

- **Patron de diseno:** forma probada de resolver problemas comunes de software.
- **Strategy:** intercambiar algoritmo sin romper el resto.
- **Specification:** reglas combinables (AND/OR/NOT) en piezas pequenas.
