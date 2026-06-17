# SDD-01E - Precarga de invitados por Excel estandar

## 1) Objetivo

Permitir que los admins carguen invitados en bloque desde un archivo Excel estandar para reducir trabajo manual y acelerar la puesta en marcha del evento.

## 2) Alcance funcional

La funcionalidad incluye:

- descarga de plantilla oficial,
- carga de archivo `.xlsx`,
- validacion estructural y de contenido,
- creacion/actualizacion de invitados,
- y sugerencia de restricciones a partir de observaciones.

## 3) Plantilla estandar (columnas)

Columnas obligatorias:

- `nombre`
- `correo`
- `telefono`

Columnas opcionales:

- `direccion`
- `categoria_1`
- `categoria_2`
- `observaciones`

Notas:

- `categoria_1` y `categoria_2` permiten preclasificar al invitado.
- `observaciones` acepta texto libre que puede derivar en sugerencias de restriccion.

## 4) Reglas de validacion

- El archivo debe ser `.xlsx`.
- Debe respetar encabezados de plantilla.
- Correo y telefono deben tener formato valido.
- Filas con error no bloquean filas correctas; se reportan para correccion.
- Debe detectarse posible duplicado por correo/telefono.

## 5) Mapeo de observaciones a restricciones

El sistema puede sugerir restricciones conocidas cuando detecta patrones en observaciones.

Ejemplos de salida sugerida:

- `intolerancia` -> restriccion alimentaria
- `no sentar con X` -> incompatibilidad (`odio`)
- `prefiere con X` -> afinidad (`amor`)

Regla clave:

- toda sugerencia requiere aprobacion manual del admin.

## 5.1) Relacion con modo de control de preferencias

- En modo `anfitrion_exclusivo`, esta importacion es una fuente principal de preferencias.
- En modo `colaborativo`, la importacion inicial puede complementarse despues con aportes del invitado.

## 6) Reporte de importacion

Tras procesar archivo, mostrar:

- filas procesadas,
- invitados creados,
- invitados actualizados,
- filas rechazadas,
- detalle de errores por fila.

## 7) Criterios de aceptacion UX

- Un admin novato debe completar la carga inicial de invitados en menos de 10 minutos.
- El reporte de errores debe ser comprensible sin lenguaje tecnico.
- Debe existir opcion de descarga de plantilla en la misma pantalla de carga.

## 8) Comentarios para principiantes

- **Precarga:** cargar datos de golpe antes de empezar a operar manualmente.
- **Plantilla estandar:** formato fijo para evitar errores de interpretacion.
- **Mapeo:** convertir texto libre en datos estructurados que entiende el sistema.

## 9) Referencias

- `docs/product/especificacion-plantilla-excel-v1.md`
