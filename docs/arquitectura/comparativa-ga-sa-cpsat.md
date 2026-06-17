# Comparativa tecnica - GA vs SA vs CP-SAT

## 1) Objetivo

Definir como comparar de forma objetiva tres enfoques de optimizacion para el motor:

- GA (algoritmo genetico)
- SA (simulated annealing + busqueda local)
- CP-SAT (refinamiento exacto/mixto)

## 2) Hipotesis de trabajo

- SA sera baseline robusta para MVP.
- GA puede mejorar diversidad y calidad de Top-K.
- CP-SAT puede mejorar calidad en instancias medianas cuando el tiempo lo permita.

## 3) Metricas de comparacion

Metricas obligatorias:

- violaciones de reglas duras (objetivo: 0)
- score global medio
- score de mejor candidata
- diversidad entre Top-K (distancia de asignaciones)
- tiempo p95 de calculo
- porcentaje de cambios manuales posteriores

## 4) Escenarios de prueba

- pequeno: 30-60 invitados
- medio: 60-140 invitados
- grande: 140-300 invitados

Cada escenario se ejecuta con varias semillas para evitar sesgo.

## 5) Criterios de adopcion para GA

GA se considera apto para produccion si:

- mantiene 0 violaciones duras,
- mejora >= 5% score medio o diversidad Top-K frente a SA en escenarios medio/grande,
- y no supera en mas de 25% el presupuesto de tiempo objetivo.

## 6) Estrategia de despliegue recomendada

1. Baseline actual: SA + busqueda local.
2. Ejecutar benchmark offline GA vs SA.
3. Habilitar GA tras feature flag para eventos seleccionados.
4. Medir impacto real y decidir adopcion definitiva.

## 7) Comentarios para principiantes

- **Baseline:** referencia inicial con la que comparas mejoras.
- **Feature flag:** interruptor para activar una funcionalidad sin desplegar para todos.
- **Diversidad Top-K:** que las propuestas no sean casi iguales entre si.
