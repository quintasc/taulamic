# ADR-009 - Forma de mesa y topologia de asientos

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

No todas las mesas tienen la misma forma, y la cercania entre invitados cambia segun geometria.
Una asignacion que ignore esta diferencia puede ser valida en capacidad, pero mala en experiencia social.

## Decision

El sistema permitira definir forma de mesa por mesa y usara esa topologia en la optimizacion.

Soporte inicial recomendado:

- redonda
- rectangular
- imperial
- ovalada

## Reglas funcionales

- Cada mesa guarda su forma y capacidad.
- El sistema deriva relaciones de proximidad por forma (adyacente, enfrente, mismo lateral).
- El motor de score usa esta proximidad real para afinidades e incompatibilidades.
- No se permiten posiciones invalidas para la forma elegida.

## Motivos de la decision

- Mejor calidad real de la distribucion.
- Mayor coherencia entre propuesta automatica y realidad del salon.
- Menos ajustes manuales de ultima hora por parte del admin.

## Consecuencias positivas

- Asignaciones socialmente mas precisas.
- Mejor explicabilidad de por que se propuso cada configuracion.

## Consecuencias negativas

- Mayor complejidad de modelado de asientos.
- Requiere UI mas rica para configurar y visualizar mesas.

## Condiciones para revisar esta decision

Reevaluar cuando:

- aparezcan nuevas formas de mesa con reglas especificas,
- o se necesite modelar distancias fisicas avanzadas (metros reales).

## Comentarios para principiantes

- **Topologia de asientos:** como se relacionan entre si las posiciones de una mesa.
- **Adyacente:** asiento al lado.
- **Enfrente:** asiento frente a otro (si la forma lo permite).
