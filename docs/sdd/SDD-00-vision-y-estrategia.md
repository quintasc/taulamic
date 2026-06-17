# SDD-00 - Vision y Estrategia

## 1) Problema a resolver

Organizar a personas en mesas para eventos puede ser lento y estresante cuando hay:

- afinidades entre invitados,
- incompatibilidades personales,
- acompanantes,
- necesidades especiales (alergias, movilidad, tipo de comida),
- y criterios del organizador que deben priorizarse.

## 2) Propuesta de valor

Crear una app que ayude a construir una distribucion de mesas que:

- maximice la satisfaccion general,
- respete restricciones importantes,
- permita ajustes manuales,
- y genere documentos operativos para salon/restaurante e invitados.

## 3) Segmentos objetivo (fase inicial y evolucion)

- **Fase MVP (recomendada):** organizadores (novios, empresa) + colaboracion de invitados.
- **Fase siguiente:** wedding planners (uso recurrente multi evento).
- **Fase posterior:** salones/restaurantes como clientes directos.

## 4) Decisiones tecnicas iniciales

- Tipo de app: `web responsive` primero.
- Arquitectura: `monolito modular` + `worker` para calculos pesados.
- Base de datos: `PostgreSQL`.
- Cola de trabajos: `Redis` (jobs asincronos).

## 5) Criterios de decision (pesos iniciales)

- Seguridad: 20%
- Coste total: 15%
- Robustez: 15%
- Concurrencia: 15%
- Rapidez de respuesta UX: 15%
- Calidad UI: 10%
- Rapidez de salida al mercado: 10%

## 6) KPIs iniciales (indicadores clave)

- Tiempo total para cerrar distribucion por evento.
- Porcentaje de propuesta automatica aceptada sin cambios.
- Numero de ajustes manuales por evento.
- Tiempo de calculo del motor (p95).
- Porcentaje de invitados que completan su perfil.
- Incidencias operativas reportadas por salon/cocina.

## 7) Comentarios para principiantes

### Que significa "vision"

Es una frase corta que responde: "que queremos lograr y para quien".

### Que significa "estrategia"

Es decidir por donde empezar para obtener resultado real con el menor riesgo posible.

### Que significa "KPI"

Un KPI es un numero que te ayuda a saber si vas bien o no.  
Ejemplo: "tiempo medio para cerrar la distribucion".

### Que significa "MVP"

MVP es la version minima util del producto.  
No es "hacer poco", es "hacer lo minimo que aporta valor real".
