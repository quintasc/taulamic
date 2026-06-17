# ADR-011 - Precarga de invitados mediante Excel estandar

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

En muchos eventos, los organizadores ya disponen de listados de invitados en hojas de calculo.
Cargar estos datos manualmente en la aplicacion es lento y propenso a errores.

## Decision

Incorporar flujo de precarga masiva de invitados mediante plantilla Excel oficial.

Incluye:

1. Descarga de plantilla `.xlsx` estandar.
2. Carga y validacion del archivo.
3. Creacion/actualizacion de invitados en lote.
4. Mapeo sugerido de observaciones a restricciones del sistema, con confirmacion manual.

## Motivos de la decision

- Reduce tiempo de onboarding del evento.
- Reduce errores por carga manual repetitiva.
- Aprovecha datos que el admin ya tiene preparados.

## Reglas operativas

- La plantilla define columnas obligatorias y opcionales.
- El sistema valida filas y genera reporte de errores legible.
- Las filas validas se procesan aunque otras fallen.
- Las sugerencias de restricciones nunca se aplican sin aprobacion del admin.
- En modo `anfitrion_exclusivo`, la precarga/importacion puede actuar como fuente principal de preferencias.

## Consecuencias positivas

- Configuracion inicial mas rapida.
- Mejor adopcion por parte de usuarios no tecnicos.
- Datos base listos antes de invitaciones y asignacion.

## Consecuencias negativas

- Requiere logica de validacion y manejo de errores por lote.
- Necesita UX clara para correccion y reintento.

## Condiciones para revisar esta decision

Reevaluar cuando:

- aparezca necesidad de soportar formatos adicionales (CSV avanzado, Google Sheets API),
- o surjan problemas recurrentes de calidad de datos en importacion.

## Comentarios para principiantes

- **Carga por lote:** subir muchos registros a la vez.
- **Plantilla estandar:** formato fijo que evita ambiguedad.
- **Mapeo de observaciones:** convertir texto libre en restricciones estructuradas.
