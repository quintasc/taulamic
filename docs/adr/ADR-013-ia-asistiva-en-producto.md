# ADR-013 - IA asistiva en producto (no decisor final)

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

El proyecto puede beneficiarse de IA para reducir friccion, pero el dominio incluye restricciones sensibles (sociales, salud, privacidad).

## Decision

Se adopta IA en modo **asistivo** para tareas de apoyo.

No se permite IA como arbitro final de asignacion de asientos.

## Ambitos permitidos

- deteccion asistida en importacion de plano,
- sugerencias desde observaciones de Excel,
- explicabilidad de resultados,
- ayuda de redaccion para invitaciones y recordatorios.

## Ambitos no permitidos (por ahora)

- decidir automaticamente distribucion final,
- aplicar restricciones criticas sin confirmacion humana.

## Motivos de la decision

- Maximiza utilidad de IA sin perder control del negocio.
- Reduce trabajo manual en pasos operativos.
- Mantiene robustez y trazabilidad en decisiones sensibles.

## Consecuencias positivas

- Mejor experiencia para admins.
- Mayor velocidad en tareas repetitivas.

## Consecuencias negativas

- Requiere diseño de validacion humana en cada sugerencia.
- Necesita controles fuertes de privacidad y auditoria.

## Condiciones para revisar esta decision

Reevaluar cuando:

- exista evidencia de que IA mejora calidad final sin aumentar riesgo,
- y se cuente con controles de seguridad/explicabilidad adecuados.

## Comentarios para principiantes

- **IA asistiva:** la IA propone, la persona decide.
- **Decisor final:** quien tiene la ultima palabra antes de guardar/aprobar.
