# Decision del motor explicada para principiantes

## 1) La pregunta simple

Como calculamos la mejor distribucion de mesas sin tardar horas?

## 2) La respuesta corta

No vamos a probar todas las combinaciones (seria demasiado lento).
Vamos a usar un metodo por pasos que da soluciones muy buenas en poco tiempo.

## 3) Que NO vamos a hacer

- No usar IA generativa como "cerebro principal" del calculo.
- No usar fuerza bruta.
- No usar computacion cuantica en esta fase.

## 4) Que SI vamos a hacer

1. Crear una primera propuesta valida rapido (heuristica).
2. Mejorarla automaticamente para subir la calidad (metaheuristica).
3. Si hay tiempo y el caso es pequeno, afinar aun mas con metodo exacto.
4. Guardar las mejores N propuestas (por defecto 3) para que el admin elija.

## 5) Por que esta decision es buena

- Es gratis (sin depender de APIs de pago para calcular).
- Es rapida para el usuario.
- Respeta reglas importantes (capacidad, incompatibilidades, accesibilidad).
- Se puede mejorar con el tiempo sin tirar lo construido.
- Permite comparar varias opciones buenas antes de aprobar.

## 6) Ejemplo muy simple

Imagina que haces grupos para una cena:

- primero haces un reparto inicial "razonable",
- luego mueves personas para que esten mejor acompanadas,
- y al final revisas algun caso conflictivo con mas detalle.

Eso mismo hace el motor, pero automaticamente y a gran escala.

## 7) Frase para contar la decision en una reunion

"Usaremos optimizacion clasica por fases (rapida + mejora + afinado opcional), porque da buen resultado, coste cero de licencias y mantiene buena experiencia de uso."

## 8) Referencias tecnicas

- `docs/arquitectura/estudio-estrategia-optimizacion-asientos.md`
- `docs/adr/ADR-006-estrategia-optimizacion-motor-asignacion.md`
