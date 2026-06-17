# SDD-01D - Importacion de plano del salon (imagen/PDF)

## 1) Objetivo

Reducir el esfuerzo de configuracion inicial permitiendo cargar un plano del salon y generar una propuesta automatica de mesas.

## 2) Alcance funcional

El sistema debe permitir:

- subir imagen (`jpg`, `png`) o documento `pdf`,
- detectar mesas candidatas,
- inferir forma de mesa y capacidad estimada,
- y presentar una preconfiguracion editable antes de confirmar.

## 3) Principio clave

La deteccion automatica es **asistida**, no totalmente autonoma.
La configuracion final siempre requiere confirmacion del admin.

## 4) Flujo recomendado

1. Subida de archivo.
2. Procesamiento automatico (vision/OCR segun formato).
3. Vista previa de detecciones con confianza.
4. Correccion manual rapida.
5. Confirmacion y guardado.

## 5) Reglas de calidad

- Si la deteccion falla parcialmente, el admin puede continuar editando manualmente.
- Nunca se bloquea la configuracion del evento por fallo de deteccion.
- Debe existir trazabilidad de origen: "manual" o "importado + editado".

## 6) Datos minimos detectados por mesa

- identificador temporal de mesa,
- forma detectada,
- capacidad estimada,
- nivel de confianza.

## 7) Criterios de aceptacion UX

- Un admin novato debe pasar de archivo subido a configuracion confirmada en menos de 5 minutos.
- Los errores de deteccion deben ser faciles de corregir en interfaz visual.
- La vista previa debe mostrar claramente que datos son estimados.

## 8) Comentarios para principiantes

- **OCR:** tecnologia para leer texto en una imagen o PDF.
- **Confianza de deteccion:** probabilidad de que una deteccion sea correcta.
- **Asistido:** el sistema ayuda, pero la decision final es de la persona usuaria.
