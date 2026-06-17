# Estudio de estrategia para optimizar distribucion de asientos

## 1) Objetivo del estudio

Justificar tecnicamente que estrategia conviene para calcular una buena distribucion de invitados sin evaluar todas las combinaciones posibles.

## 2) Naturaleza del problema

El problema de asignar invitados a mesas con restricciones y preferencias es un problema de **optimizacion combinatoria**.
En la practica se comporta como problema NP-hard (o NP-completo en variantes de decision), por lo que:

- fuerza bruta no es viable para tamanos reales,
- y se necesitan tecnicas de optimizacion con poda, busqueda inteligente o aproximacion.

## 3) Criterios de evaluacion para elegir estrategia

- Calidad del resultado (maximizar satisfaccion global).
- Cumplimiento estricto de reglas duras (siempre 0 violaciones).
- Tiempo de calculo razonable para UX.
- Coste economico (preferencia por herramientas gratuitas).
- Mantenibilidad del codigo en equipo pequeno.
- Explicabilidad del resultado para admins.

## 4) Opciones evaluadas

### Opcion A - IA generativa (LLM) como motor principal

Ventajas:

- Puede ayudar a explicar decisiones en lenguaje natural.

Desventajas:

- No garantiza cumplimiento estricto de restricciones.
- No es determinista para optimizacion fina.
- Riesgo alto de resultados inconsistentes en casos conflictivos.

Conclusion:

- **No recomendada** como motor principal de asignacion.

### Opcion B - Busqueda exacta (Branch and Bound / solver exacto)

Ventajas:

- Puede encontrar optimo global en instancias pequenas.
- Ofrece buena base teorica para validar calidad.

Desventajas:

- Escala mal en instancias medianas/grandes.
- Tiempo de calculo puede crecer demasiado.

Conclusion:

- Recomendable para instancias pequenas o para validacion, no como unico enfoque en produccion.

### Opcion C - Programacion por restricciones (CP-SAT, ejemplo OR-Tools)

Ventajas:

- Herramienta gratuita y robusta.
- Excelente para combinar restricciones duras + objetivo con pesos.
- Permite limite de tiempo y devuelve mejor solucion encontrada.

Desventajas:

- Modelado mas tecnico.
- Integracion puede requerir worker especializado (segun stack elegido).

Conclusion:

- Muy buena opcion para evolucion del motor cuando se necesite mayor calidad.

### Opcion D - Metaheuristicas (busqueda local, simulated annealing, tabu, etc.)

Ventajas:

- Rapidas para encontrar buenas soluciones.
- Escalan mejor en tiempos acotados.
- Faciles de integrar en stack TypeScript.

Desventajas:

- No garantizan optimo global.
- Requieren calibrar parametros y funcion objetivo.

Conclusion:

- Excelente opcion para MVP por equilibrio coste/tiempo/calidad.

## 5) Decision recomendada para este proyecto

Adoptar una estrategia **hibrida sin IA generativa como motor principal**:

1. Construir solucion factible inicial con heuristica (cumpliendo reglas duras).
2. Mejorar con busqueda local + metaheuristica (simulated annealing multi-arranque).
3. Aplicar refinamiento exacto opcional (Branch and Bound o CP-SAT) en:
   - instancias pequenas,
   - o cuando haya tiempo de calculo extra.
4. Devolver siempre la mejor solucion valida encontrada dentro de limite de tiempo.

## 6) Justificacion de la decision

- Es gratuita (algoritmos clasicos y librerias open source).
- Mantiene buena UX al limitar tiempo de calculo.
- Garantiza reglas duras (lo mas importante).
- Evita dependencia de IA generativa para decisiones criticas.
- Permite evolucion futura a CP-SAT sin rehacer todo.

## 7) Recomendacion sobre IA

IA generativa puede usarse en funciones auxiliares:

- explicar por que una persona quedo en una mesa,
- sugerir ajustes manuales al admin,
- redactar mensajes de conflicto de reglas.

Pero **no** como mecanismo de optimizacion principal.

## 8) Plan de evaluacion (benchmark) para validar estrategia

### Metricas minimas

- Violaciones de reglas duras: objetivo = 0.
- Score total de satisfaccion: maximizar.
- Tiempo de calculo p95 por tamano de evento.
- Porcentaje de cambios manuales tras autoasignacion.

### Escenarios de prueba

- Eventos pequenos (30-60 invitados).
- Eventos medios (60-140 invitados).
- Eventos grandes (140-300 invitados).

### Criterios de aceptacion sugeridos

- p95 <= 3 s para eventos pequenos.
- p95 <= 8 s para eventos medios.
- p95 <= 20 s para eventos grandes.
- 0 violaciones de reglas duras en todos los escenarios.

## 9) Encaje con arquitectura actual

Esta estrategia encaja con la arquitectura ya definida:

- API NestJS recibe solicitud de calculo.
- Worker ejecuta optimizacion en segundo plano.
- Redis/BullMQ gestiona cola y reintentos.
- Resultado versionado vuelve a base de datos.

## 10) Comentarios para principiantes

- **NP-hard / NP-completo:** problemas donde no hay metodo rapido conocido para todos los casos.
- **Heuristica:** metodo rapido que suele dar una buena solucion.
- **Metaheuristica:** tecnica general para mejorar heuristicas y escapar de minimos locales.
- **Branch and Bound:** tecnica exacta que poda ramas para evitar explorar todo.
