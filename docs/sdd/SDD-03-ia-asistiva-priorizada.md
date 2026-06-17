# SDD-03 - IA asistiva priorizada

## 1) Objetivo

Priorizar donde introducir IA para mejorar facilidad, velocidad y experiencia sin comprometer control ni seguridad.

## 2) Principio rector

La IA **ayuda** a decidir, pero no **decide sola** en elementos criticos.

## 3) Mapa de oportunidades (impacto vs esfuerzo)

### Prioridad Alta (alto impacto, esfuerzo medio)

1. Importacion asistida de plano (deteccion de mesas/forma/capacidad).
2. Sugerencias de restricciones desde observaciones en Excel.
3. Explicacion en lenguaje simple de diferencias entre candidatas Top-K.

### Prioridad Media (impacto medio, esfuerzo bajo)

4. Asistente de redaccion para invitaciones y recordatorios RSVP.
5. Sugerencias de acciones al admin ("mueve X a mesa Y y mejora Z").

### Prioridad Baja (evaluar mas adelante)

6. Recomendador conversacional completo de configuracion de evento.
7. Modos experimentales de optimizacion hibrida con aprendizaje adaptativo.

## 4) Guardarrailes obligatorios

- Confirmacion humana para aplicar sugerencias sensibles.
- Registro de origen de sugerencia (manual, IA, importacion).
- Opcion clara de deshacer/corregir.
- Trazabilidad de por que se mostro una recomendacion.

## 5) Riesgos y mitigacion

- Riesgo de falsa confianza -> mostrar nivel de confianza y limites.
- Riesgo de privacidad -> minimizacion de datos y control por rol.
- Riesgo de sesgo -> validaciones y revisiones periodicas de calidad.

## 6) KPI de IA sugeridos

- tiempo ahorrado en configuracion inicial,
- tasa de aceptacion de sugerencias IA,
- tasa de correccion posterior de sugerencias aplicadas,
- satisfaccion del admin con explicaciones de IA.

## 7) Comentarios para principiantes

- **Guardarrail:** regla de seguridad para que la IA no se salga de control.
- **Confianza de sugerencia:** probabilidad estimada de que la recomendacion sea correcta.
