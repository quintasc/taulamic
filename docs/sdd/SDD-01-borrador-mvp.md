# SDD-01 - Borrador de Alcance MVP

## 1) Alcance funcional MVP

La aplicacion debe permitir:

1. Crear un evento y configurar mesas (cantidad, nombre, capacidad).
2. Registrar invitados y estado de asistencia.
3. Definir categorias/grupos (ejemplo: amigos del novio, familia, companeros de trabajo).
4. Permitir que invitados indiquen afinidades, incompatibilidades y preferencias.
5. Registrar acompanantes y reglas asociadas.
6. Registrar necesidades especiales:
   - alergias/intolerancias,
   - tipo de dieta (vegano, halal, etc.),
   - accesibilidad (silla de ruedas, elevador, etc.).
7. Calcular propuesta automatica de distribucion.
8. Permitir cambios manuales por parte de administradores.
9. Aprobar una version final.
10. Generar documentos descargables para salon/cocina/invitados.
11. Programar fecha de visibilidad para invitados (sin superar fecha del evento).

## 2) Roles

- `Admin`: organizador principal (novios / planner / empresa).
- `Invitado`: completa su informacion y consulta su mesa cuando se publique.
- `Salon`: acceso operativo a informacion necesaria para preparar el servicio.

## 3) Reglas duras (no se pueden romper)

- No superar capacidad de mesa.
- Respetar bloqueos manuales del admin.
- Respetar incompatibilidades marcadas como obligatorias.
- Respetar restricciones de accesibilidad obligatorias.
- No publicar distribucion a invitados despues de fecha del evento.

## 4) Reglas blandas (se optimizan)

- Afinidad por categorias o grupos.
- Preferencias de compania.
- Preferencias de tipo de mesa (ejemplo: mesa de solteros).
- Criterios extra del admin con mayor peso.

## 5) Estados del plan de mesas

- `Borrador`
- `Calculando`
- `Propuesto`
- `Aprobado`
- `Publicado a invitados`

## 6) Entregables de documento

- Plano por mesas con nombres.
- Listado operativo por mesa para salon.
- Resumen de cocina (alergias, dietas, observaciones utiles).
- Etiquetas imprimibles por mesa/comensal.

## 7) Seguridad y privacidad (MVP)

- Datos sensibles visibles solo por rol autorizado.
- "Amores/odios" visibles solo para admins.
- Invitados solo ven su informacion y salida publicada permitida.
- Registro de acciones criticas (aprobacion, publicacion, descarga de documentos).

## 8) Comentarios para principiantes

### Que es una "regla dura"

Es una regla que jamas se rompe.  
Si se rompe, la solucion no sirve.

### Que es una "regla blanda"

Es una preferencia que se intenta cumplir, pero puede sacrificarse si hay conflicto.

### Que es "alcance"

Es la lista clara de lo que SI entra en esta fase y, por tanto, lo que NO entra.

### Que es "rol"

Es el tipo de usuario y los permisos que tiene dentro del sistema.
