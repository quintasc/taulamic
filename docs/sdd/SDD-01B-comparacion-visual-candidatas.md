# SDD-01B - Comparacion visual rapida de candidatas

## 1) Objetivo

Permitir que el admin compare rapidamente las mejores candidatas (Top-K) y elija una base de forma clara, sin revisar mesa por mesa de manera manual.

## 2) Principio UX

La comparacion debe responder en pocos segundos a esta pregunta:

"Cual de estas opciones es mejor para aprobar ahora?"

## 3) Estructura de pantalla recomendada

### 3.1 Cabecera de comparacion

- Selector de candidatas (por defecto Top-3).
- Boton "usar como base" por candidata.
- Indicador de fecha/hora de calculo.

### 3.2 Tarjetas resumen por candidata

Cada candidata debe mostrar de forma visible:

- score global de felicidad,
- score por criterio (afinidad, restricciones admin, etc.),
- numero de conflictos blandos,
- confirmacion de 0 violaciones de reglas duras.

### 3.3 Vista de diferencias rapidas

- Diferencias principales entre candidata A, B y C.
- Conteo de personas que cambian de mesa entre candidatas.
- Mesas mas "sensibles" (donde hay mas cambios).

### 3.4 Detalle expandible por mesa

- Lista de mesas con indicador de estabilidad (alto/medio/bajo).
- Al abrir una mesa, mostrar cambios de comensales entre candidatas.
- Debe visualizarse la forma real de la mesa para entender cercanias (no solo lista plana).

## 4) Reglas de visualizacion

- Colores semanticos consistentes:
  - verde: mejor o estable,
  - amarillo: atencion,
  - rojo: peor relativo.
- No depender solo de color; incluir iconos/texto para accesibilidad.
- Mantener siempre visible el score global de cada candidata.

## 5) Interacciones clave

- Seleccionar candidata base en maximo 3 acciones.
- Filtro rapido por:
  - mesas con mas cambios,
  - mesas con accesibilidad,
  - mesas con restricciones sensibles.
- Opcion de "comparar A vs B" para foco en dos candidatas.
- Opcion de resaltar cambios de posicion relativa (al lado, enfrente, mismo lateral) segun forma de mesa.

## 6) Criterios de aceptacion UX

- Un admin novato debe poder identificar la candidata recomendada en menos de 2 minutos.
- Debe ser posible comparar Top-3 sin cambiar de pantalla.
- Debe quedar claro cuando una candidata no cumple un umbral objetivo de score.

## 7) Integracion con Figma

Este documento define el contenido minimo que debe verse en el prototipo de comparacion.
Debe implementarse en `SDD-01A` como pantalla clave del flujo admin.

## 8) Comentarios para principiantes

- **Candidata:** una propuesta de distribucion generada por el motor.
- **Score:** numero que resume la calidad de la candidata.
- **Comparacion visual:** ver diferencias importantes sin leer datos crudos uno por uno.
