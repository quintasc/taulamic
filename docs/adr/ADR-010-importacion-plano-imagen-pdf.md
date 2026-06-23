# ADR-010 - Importacion de plano desde imagen/PDF

- Estado: Aceptado (**superseded parcialmente** por `ADR-016-plano-espacial-salon-dos-fases.md`, 2026-06-23)
- Fecha: 2026-06-17

> **Nota 2026-06-23:** El flujo principal de producto ya no usa la deteccion de mesas como onboarding obligatorio. Ver `ADR-016` y `SDD-01D` actualizado. La API EP-11 (`floor-plans` + `detect`) permanece como capacidad tecnica; la UI piloto implementa plano espacial en dos fases.

## Contexto

Muchos organizadores reciben del salon un plano en imagen o PDF, no una configuracion estructurada.
Configurar todo manualmente consume tiempo y aumenta errores.

## Decision

El sistema soportara dos entradas de configuracion de mesas:

1. **Manual** (siempre disponible).
2. **Importacion asistida** desde imagen/PDF con deteccion automatica.

Formato inicial soportado:

- JPG
- PNG
- PDF

## Reglas operativas

- La deteccion propone numero de mesas, forma y capacidad estimada.
- Cada deteccion incluye nivel de confianza.
- La confirmacion final del admin es obligatoria.
- Si la deteccion falla, el flujo manual sigue disponible sin bloqueo.

## Motivos de la decision

- Reduce tiempo de puesta en marcha del evento.
- Mejora experiencia para usuarios no tecnicos.
- Mantiene control humano final para evitar errores criticos.

## Consecuencias positivas

- Menos carga operativa inicial.
- Mayor adopcion en eventos reales con planos existentes.

## Consecuencias negativas

- Mayor complejidad tecnica (vision/OCR y validacion).
- Posibles errores de deteccion en planos de baja calidad.

## Condiciones para revisar esta decision

Reevaluar cuando:

- la calidad de deteccion sea baja de forma recurrente,
- o aparezcan necesidades de formatos CAD/planos avanzados.

## Comentarios para principiantes

- **Importacion asistida:** el sistema propone, la persona confirma.
- **Confianza de deteccion:** probabilidad estimada de que la deteccion sea correcta.
- **Fallback manual:** camino alternativo manual cuando la automatizacion no es suficiente.
