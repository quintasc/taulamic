# Decision del motor explicada para principiantes

> **Vigencia:** texto actualizado **2026-08-06** al runtime del piloto.  
> Detalle técnico: [`ADR-023`](../adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md), [`ADR-024`](../adr/ADR-024-reparto-proporcional-por-categoria.md), [`arquitectura-operativa-piloto.md`](arquitectura-operativa-piloto.md).  
> Estudios previos (heurística + SA + Top-K): históricos; ver cabeceras en esta carpeta y ADR-006.

## 1) La pregunta simple

Como calculamos una buena distribucion de mesas sin tardar horas?

## 2) La respuesta corta (piloto hoy)

No probamos todas las combinaciones.
Usamos un **solver de restricciones CP-SAT** (OR-Tools via Wasm en el servidor) que:

1. Asigna invitados a **mesas** (fase 1, con reglas de categoria ADR-024).
2. Asigna **sillas** dentro de cada mesa (fase 2).
3. Corre en **segundo plano** en la API (job async); la UI consulta el progreso.

Hay un motor **v0** (heuristica) solo como **fallback** por configuracion, no como camino principal del piloto.

## 3) Que NO hacemos en el piloto

- No usar IA generativa como cerebro del calculo.
- No usar fuerza bruta.
- No devolver Top-K candidatas (queda diferido: ADR-007 / issues #11–#12).
- No usar cola Redis/BullMQ aun (tracker in-process).

## 4) Que SI hacemos

1. Cumplir reglas duras (capacidad, incompatibilidades, acompanantes juntos, etc.).
2. Optimizar con pesos blandos (afinidades, categorias, packing…).
3. Permitir **ajuste manual** despues (mover, desasignar, sillas).
4. Confirmar una propuesta y generar PDF en el navegador.

## 5) Por que esta decision es buena

- Coste de licencia cero (OR-Tools / Apache 2.0).
- Respeto fuerte de restricciones frente a un LLM.
- Evolucion documentada desde la estrategia hibrida SA (ADR-006) hacia CP-SAT (ADR-023).

## 6) Frase para una reunion

"En el piloto el motor principal es CP-SAT en dos fases (mesa y silla), asincrono en la API; el admin puede retocar a mano y confirmar. Top-K y worker/cola quedan para despues."

## 7) Referencias

- `docs/adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md`
- `docs/adr/ADR-024-reparto-proporcional-por-categoria.md`
- `docs/arquitectura/arquitectura-operativa-piloto.md`
- Historico: `estudio-estrategia-optimizacion-asientos.md`, `ADR-006`
