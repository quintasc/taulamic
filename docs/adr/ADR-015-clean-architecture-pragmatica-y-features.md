# ADR-015 - Clean Architecture pragmatica y organizacion por features

- Estado: Aceptado
- Fecha: 2026-06-18

## Contexto

Taulame ya decidio (ADR-002) un monolito modular con worker y (ADR-004) patrones de dominio como Repository, Strategy y Specification.

El codigo backend ha empezado con NestJS (`apps/api`) y el primer modulo `floor-plans` (#22 / HU-31).

Se quiere dejar explicito el estilo arquitectonico objetivo sin frenar el MVP ni sobrecargar a un equipo principiante.

## Decision

Se adopta **Clean Architecture pragmatica** dentro del monolito NestJS:

1. **Dominio en el centro:** reglas de negocio puras, sin depender de NestJS, HTTP ni base de datos.
2. **Aplicacion:** casos de uso que orquestan el dominio (ejemplo: `SubirPlano`, `DetectarMesas`).
3. **Infraestructura:** adaptadores tecnicos (almacenamiento de ficheros, PostgreSQL, Redis, cola, vision/OCR).
4. **Presentacion:** controllers, DTOs y contrato OpenAPI.

Las dependencias apuntan **hacia dentro** (infraestructura y presentacion dependen de aplicacion/dominio; nunca al reves).

### Organizacion por features

Cada capacidad de negocio se agrupa como **modulo/feature vertical** alineado con epicas del backlog (EP-11 plano, EP-12 Excel, motor de asignacion, etc.).

**Convencion de carpetas en MVP temprano:**

```text
apps/api/src/<feature>/
  presentation/     # controller, DTOs (cuando crezca el modulo)
  application/      # casos de uso
  domain/           # entidades, validadores, reglas puras
  infrastructure/   # repositorios, adaptadores externos
```

**En la fase actual** basta con un modulo NestJS por feature en `src/<feature>/` (como `floor-plans/`). Las subcarpetas por capa se introducen **de forma progresiva** cuando el modulo gana complejidad o al crear el segundo/tercer modulo con logica de negocio relevante.

No se exige refactor masivo del codigo existente solo por cumplir la convencion.

## Relacion con decisiones previas

| Documento | Relacion |
|-----------|----------|
| ADR-002 | Monolito modular + worker; Clean Architecture organiza el interior de cada modulo |
| ADR-004 | Repository, Strategy, Specification encajan en dominio/aplicacion |
| ADR-010 | Deteccion asistida de plano: dominio + aplicacion; vision/OCR en infraestructura |

## Reglas de aplicacion por fase

| Regla | MVP temprano (ahora) | A partir de modulos criticos |
|-------|----------------------|------------------------------|
| Controller solo orquesta HTTP | Si | Si |
| Logica de negocio fuera del controller | Si | Si |
| Caso de uso explicito por operacion importante | Progresivo (#23 en adelante) | Si |
| Repository al persistir en BD | Cuando exista persistencia | Si |
| Carpeta `features/` obligatoria en raiz | No | Reevaluar con 3+ modulos |
| Refactor retroactivo sin necesidad | No | No |

## Motivos de la decision

- Mantiene el negocio (SDD) desacoplado del framework.
- Facilita tests unitarios del dominio sin levantar NestJS.
- Escala con el producto sin saltar a microservicios.
- Evita burocracia de capas vacias en el primer vertical slice.

## Consecuencias positivas

- Direccion clara para nuevos modulos (#23, Excel, motor).
- Coherencia con patrones ya aceptados en ADR-004.
- Menor riesgo de “bola de nieve” en controllers.

## Consecuencias negativas

- Curva de aprendizaje de capas y dependencias.
- Riesgo de sobreestructurar si se aplican todas las carpetas demasiado pronto.

**Mitigacion:** aplicacion progresiva; el ADR define el destino, no obliga a reescribir `floor-plans` antes de cerrar #22.

## Condiciones para revisar esta decision

Reevaluar cuando:

- existan 3 o mas modulos con logica de negocio sustancial,
- el equipo crezca y necesite convenciones mas estrictas,
- o la estructura actual dificulte tests o despliegues.

## Comentarios para principiantes

- **Clean Architecture:** el negocio va en el centro; lo tecnico (web, BD, ficheros) es periferia intercambiable.
- **Feature / modulo vertical:** una pieza del producto de punta a punta (ejemplo: importar plano).
- **Caso de uso:** una accion concreta que el sistema permite (ejemplo: “subir plano valido”).
- **Pragmatica:** se adopta el principio sin crear carpetas vacias “por postureo”.
