# Politica de validacion de tests y cobertura

- Estado: **Vigente**
- Alcance: desarrollo, revisiones, CI y cierre de issues/sprints
- Fecha: 2026-06-17
- Relacionado con: `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`

## 1) Objetivo

Definir **con que criterios se acepta o rechaza** el trabajo tecnico en Taulamic, de forma profesional y comprensible para personas que estan empezando en metodologia y testing.

Esta politica **no sustituye** al SDD. La complementa con reglas automaticas y de proceso.

## 2) Conceptos clave (con explicacion sencilla)

| Termino | Que significa en la practica |
|---------|------------------------------|
| **Test (prueba automatica)** | Programa que comprueba un comportamiento concreto del sistema. |
| **Test unitario** | Prueba una pieza aislada (ejemplo: validador de archivo). |
| **Test e2e (end-to-end)** | Prueba un flujo completo por HTTP (ejemplo: subir un PDF al endpoint). |
| **Test en verde / rojo** | Pasa o falla. Es binario: no hay “medio aprobado”. |
| **Cobertura de codigo (*code coverage*)** | Porcentaje del codigo ejecutado al correr tests. **No mide calidad del producto por si sola.** |
| **Quality gate (puerta de calidad)** | Regla que bloquea avanzar si no se cumple (ejemplo: tests en rojo). |
| **CI (Integracion Continua)** | Sistema que ejecuta build y tests automaticamente en cada cambio (GitHub Actions). |
| **Criterio de aceptacion** | Condicion funcional del SDD/issue que debe cumplirse para dar una tarea por valida. |
| **DoD (Definition of Done)** | Lista de condiciones para considerar una tarea o sprint realmente terminado. |

### Aclaracion importante sobre el “85% profesional”

En muchos equipos, cuando dicen *“no se acepta si no supera el 85%”*, se refieren a **cobertura de codigo**, no a:

- un 85% de tests pasados (eso seria binario: todos o no todos),
- ni un 85% de requisitos del SDD cumplidos (eso debe ser **100%** de los criterios de la issue, salvo decision explicita).

**Cobertura alta sin tests alineados al SDD puede dar falsa seguridad.** Por eso en Taulamic usamos un modelo en capas.

## 3) Modelo de validacion en capas

Un cambio se considera **aceptable** solo si cumple **todas** las capas que le apliquen.

```text
Capa 1 — Tecnica automatica (binaria)
  build OK + tests OK

Capa 2 — Cobertura (numerica, por modulos criticos)
  umbral minimo de code coverage

Capa 3 — Funcional SDD (checklist)
  criterios de aceptacion de la issue cubiertos

Capa 4 — Proceso (humana)
  documentacion, PR y revision cuando corresponda
```

### Capa 1: Gates tecnicos obligatorios (siempre)

Comandos de referencia en `apps/api`:

```bash
npm run build
npm test
npm run test:e2e
```

| Resultado | Decision |
|-----------|----------|
| Todos exit code 0 | Capa 1 **aprobada** |
| Cualquier fallo | Capa 1 **rechazada** (no merge / no cierre de issue) |

> **Para principiantes:** si un test falla, lo normal es corregir el codigo para cumplir el SDD, no cambiar el SDD para que el test pase.

### Capa 2: Cobertura de codigo (numerica, por fases)

La cobertura se mide con:

```bash
cd apps/api
npm run test:cov
```

Jest reporta, entre otros, **lines** (lineas), **branches** (ramas if/else), **functions** y **statements**.

#### Politica por fases

| Fase | Cuando | Regla |
|------|--------|-------|
| **Fase A (actual)** | MVP temprano, poco codigo | No bloquear por % global. Exigir tests ligados a criterios SDD/issue. |
| **Fase B** | CI activa + modulos criticos con tests | Umbral **>= 80%** en modulos criticos (ver seccion 4). |
| **Fase C** | Producto con varios sprints de codigo | Subir modulos criticos a **>= 85%** (estandar profesional habitual). |

**Modulo critico:** codigo donde un fallo impacta datos, permisos, importaciones, motor de asignacion o reglas de negocio. Ejemplos: `floor-plans`, importacion Excel, permisos por modo, motor de distribucion.

**Modulo no critico (al inicio):** bootstrap (`main.ts`), wiring de modulos, DTOs decorativos. Ahi la cobertura global puede ser baja sin bloquear el avance, siempre que lo critico este cubierto.

> **Para principiantes:** el 85% no es una nota del examen del producto. Es “que parte del codigo critico hemos ejecutado con tests”. Un 85% con malos tests sigue siendo malo.

### Capa 3: Validacion funcional contra SDD (checklist)

Para **cerrar una issue**, hace falta **100%** de sus criterios de aceptacion demostrados, con:

- test automatico, o
- evidencia manual documentada (captura, pasos, enlace a PR), cuando aun no exista automatizacion.

Los tests deben **trazarse** al SDD o a la issue. Ejemplo:

```text
Issue #22 / HU-31
  -> e2e: PDF valido => 201
  -> e2e: JPG valido => 201
  -> e2e: PNG valido => 201
  -> e2e: GIF invalido => INVALID_FILE_TYPE
  -> e2e: sin archivo => FILE_REQUIRED
  -> e2e: tamano excedido => FILE_TOO_LARGE
  -> unitario: validador de extension, mime y tamano
```

Si los tests pasan pero queda un criterio sin cubrir, la issue **no esta cerrada**.

### Capa 4: Proceso y documentacion

Segun `docs/sdd/SDD-02-backlog-inicial.md`, una issue terminada tambien requiere:

- documentacion actualizada si el comportamiento cambia,
- enlace a commit/PR,
- revision cuando el flujo del equipo lo exija.

## 4) Umbrales numericos acordados (Taulamic)

Valores objetivo para **modulos criticos** (no para todo el repositorio al inicio):

| Metrica Jest | Fase B (objetivo) | Fase C (madurez) |
|--------------|-------------------|------------------|
| Lines | >= 80% | >= 85% |
| Statements | >= 80% | >= 85% |
| Functions | >= 80% | >= 85% |
| Branches | >= 75% | >= 80% |

**Activacion:** el umbral numerico **bloquea** merges solo cuando:

1. exista CI configurada, y
2. el modulo tenga bateria de tests suficiente para que el umbral sea justo.

Hasta entonces, el umbral es **objetivo de trabajo**, no castigo automatico.

## 5) Decision rapida: se acepta o no?

| Pregunta | Si NO -> rechazado |
|----------|-------------------|
| ¿Compila (`npm run build`)? | Si falla build |
| ¿Todos los tests pasan? | Si hay test rojo |
| ¿Cumple criterios SDD/issue de esa tarea? | Si falta algun criterio |
| ¿Modulo critico cumple cobertura de su fase? | Solo cuando CI + fase B/C activas |
| ¿Se respeto gobernanza SDD (sin degradar requisitos)? | Si se rebajo alcance funcional sin aprobacion |

**No existe un unico “indice final”** tipo 0–100 que reemplace este checklist.

## 6) Que hacer cuando algo falla

### Test en rojo

1. Identificar que criterio SDD/issue verifica el test.
2. Corregir implementacion para cumplir el SDD.
3. Si el test esta mal planteado respecto al SDD, **parar** y pedir aprobacion (ver gobernanza SDD).

### Cobertura por debajo del umbral (fase B/C)

1. Anadir tests que ejecuten ramas no cubiertas **en comportamiento relevante**.
2. No anadir tests vacios solo para subir el porcentaje.

### Criterio SDD sin test

1. Anadir test o evidencia manual.
2. No cerrar la issue hasta cubrirlo.

## 7) Relacion con la gobernanza del SDD

Orden de prioridad:

1. **SDD** (que debe hacer el producto)
2. **Criterios de aceptacion** de la issue
3. **Tests** (verificacion automatica derivada de lo anterior)
4. **Cobertura** (complemento numerico del codigo critico)

Regla de oro: **los tests validan el SDD; no redefinen el SDD.**

## 8) Comandos utiles

```bash
# Capa 1 — obligatorio antes de PR
cd apps/api
npm run build
npm test
npm run test:e2e

# Capa 2 — consulta de cobertura
npm run test:cov
```

La salida de cobertura se genera en `apps/api/coverage/`.

## 9) Evolucion prevista del proyecto

1. **Ahora:** documentar trazabilidad SDD ↔ tests por issue.
2. **Siguiente:** workflow CI (build + tests) en GitHub Actions.
3. **Despues:** activar `coverageThreshold` en Jest para modulos criticos (80% -> 85%).

## 10) Resumen para principiantes

- **Profesional** no es solo perseguir un 85%.
- **Profesional** es: tests que pasan, requisitos del SDD cumplidos, y cobertura alta en lo critico.
- El **85%** del que hablan en la industria suele ser **cobertura de codigo en modulos importantes**, no una nota global del proyecto.
- En Taulamic, **cerrar una tarea** exige cumplir el SDD; la cobertura ayuda, pero no lo reemplaza.
