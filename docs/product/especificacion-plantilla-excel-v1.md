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
7. `menu_especial` — vacío = no; `X` / `Si` = sí; activa alerta de menú en panel Invitados v2
8. `movilidad_reducida` — vacío = no; `X` / `Si` = sí; activa alerta de movilidad en panel Invitados v2
9. `notas_internas` — texto libre solo visible para el organizador
10. `acompanante_key`
11. `separar_acompanante`

### Piloto julio (2026-06-24)

- La **plantilla descargable** ya **no incluye** `preferencia_control` (modo en pantalla Preferencias).
- La **importacion** sigue aceptando archivos legacy con esa columna opcional.

### MEJ-02 (2026-06-28)

- `observaciones` sustituido por `notas_internas` en plantilla nueva.
- Import legacy con columna `observaciones` sigue aceptado (mapeo a notas internas + sugerencias IA).

Legacy (solo importacion, no en plantilla nueva):

12. `observaciones` — texto libre; genera sugerencias de restricciones si aplica
13. `preferencia_control` — override por fila si el archivo lo trae; por defecto usa modo del evento.

## 4) Semantica de campos clave

- `acompanante_key`: identificador comun para personas que vienen juntas (ejemplo: `PAREJA_001`).
- `separar_acompanante`: vacío = no separar; `X` / `Si` = excepción explícita en grupo acompañante.
- `menu_especial` / `movilidad_reducida`: vacío = no; `X` / `Si` activan iconos en Invitados v2. Import legacy acepta también `true`/`false`.
- `notas_internas`: texto libre del organizador; no genera sugerencias automaticas.
- `preferencia_control`: `colaborativo` o `anfitrion_exclusivo` — **solo import legacy**; en piloto el modo es **anfitrión exclusivo** (configuración del evento).

## 5) Reglas de validacion

- `nombre`: no vacio, max 120 caracteres.
- `correo`: formato email valido.
- `telefono`: formato telefono valido segun pais configurado.
- `categoria_1`, `categoria_2`: texto libre corto (max 80) o catalogo si activado.
- `separar_acompanante`, `menu_especial`, `movilidad_reducida`: vacío, `X`, `Si` (import legacy: `true`/`false`).
- `acompanante_key`: requerido si hay acompanante; mismo valor para integrantes del grupo acompanante.

## 6) Reglas de negocio en importacion

- Si `acompanante_key` coincide en varias filas, se interpreta como grupo acompanante.
- Si `separar_acompanante` está marcado (`X` / `Si` / legacy `true`), se registra excepcion explicita.
- Si `observaciones` (legacy) contiene patrones conocidos, se generan sugerencias de restricciones (nunca autoaplicadas).
- `notas_internas` no dispara sugerencias automaticas (MEJ-02).

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
