# Especificacion tecnica - Plantilla Excel v1

## 1) Objetivo

Definir formato exacto de la plantilla Excel para precarga masiva de invitados.

## 2) Formato de archivo

- Extension: `.xlsx`
- Hoja principal: `invitados`
- Fila 1: encabezados obligatorios (sin cambios de nombre)

## 3) Columnas v1

Obligatorias:

1. `nombre`
2. `correo`
3. `telefono`

Opcionales:

4. `direccion`
5. `categoria_1`
6. `categoria_2`
7. `observaciones`
8. `acompanante_key`
9. `separar_acompanante`
10. `preferencia_control` (opcional por fila, si aplica override permitido)

## 4) Semantica de campos clave

- `acompanante_key`: identificador comun para personas que vienen juntas (ejemplo: `PAREJA_001`).
- `separar_acompanante`: `true/false` para excepcion explicita a regla de acompanantes juntos.
- `preferencia_control`: `colaborativo` o `anfitrion_exclusivo` (si el sistema permite override por invitado/grupo; por defecto se usa modo del evento).

## 5) Reglas de validacion

- `nombre`: no vacio, max 120 caracteres.
- `correo`: formato email valido.
- `telefono`: formato telefono valido segun pais configurado.
- `categoria_1`, `categoria_2`: texto libre corto (max 80) o catalogo si activado.
- `separar_acompanante`: solo `true` o `false`.
- `acompanante_key`: requerido si hay acompanante; mismo valor para integrantes del grupo acompanante.

## 6) Reglas de negocio en importacion

- Si `acompanante_key` coincide en varias filas, se interpreta como grupo acompanante.
- Si `separar_acompanante=true`, se registra excepcion explicita.
- Si `observaciones` contiene patrones conocidos, se generan sugerencias de restricciones (nunca autoaplicadas).

## 7) Catalogo de errores sugerido (codigos)

- `XLS-001`: encabezado faltante o incorrecto.
- `XLS-002`: formato de correo invalido.
- `XLS-003`: formato de telefono invalido.
- `XLS-004`: duplicado detectado por correo/telefono.
- `XLS-005`: valor invalido en `separar_acompanante`.
- `XLS-006`: `acompanante_key` inconsistente.
- `XLS-007`: fila vacia o incompleta en campos obligatorios.

## 8) Resultado esperado de importacion

- Conteo total de filas procesadas.
- Conteo de invitados creados.
- Conteo de invitados actualizados.
- Conteo de filas rechazadas.
- Reporte descargable de errores por fila.

## 9) Compatibilidad futura

Posibles extensiones v2:

- `idioma_preferido`,
- `restricciones_alimentarias_codificadas`,
- `mesa_preferida`,
- `codigo_familia`.
