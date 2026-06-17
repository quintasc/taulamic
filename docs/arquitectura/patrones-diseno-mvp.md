# Patrones de diseno para este proyecto (MVP)

## 1) Objetivo

Definir patrones de diseno concretos para evitar caos tecnico a medida que crece la app.

## 2) Patrones seleccionados y uso practico

### 2.1 Strategy (motor de asignacion)

Uso:

- Permitir varias estrategias de calculo segun tipo de evento o nivel de complejidad.

Ejemplo en este dominio:

- Estrategia base de afinidad por grupos.
- Estrategia con peso alto para restricciones del admin.

### 2.2 Specification (reglas del dominio)

Uso:

- Expresar reglas como piezas combinables.

Ejemplo:

- `CapacidadDisponibleSpecification`
- `CompatibilidadInvitadosSpecification`
- `AccesibilidadMesaSpecification`

### 2.3 State (estado del plan)

Uso:

- Controlar transiciones permitidas del plan de asientos.

Estados:

- `Borrador -> Calculando -> Propuesto -> Aprobado -> Publicado`

### 2.4 Command + cola (procesos asincronos)

Uso:

- Ejecutar tareas pesadas fuera del flujo de peticion web.

Comandos tipicos:

- `CalcularDistribucionCommand`
- `GenerarDocumentosCommand`
- `PublicarPlanCommand`

### 2.5 Repository (persistencia desacoplada)

Uso:

- Separar logica de negocio de detalles de base de datos.

Repositorios recomendados:

- `EventoRepository`
- `InvitadoRepository`
- `PlanAsientosRepository`

### 2.6 Factory (generacion de documentos)

Uso:

- Crear distintos documentos con una interfaz uniforme.

Tipos:

- Plano de mesas.
- Listado por mesa.
- Resumen cocina.
- Etiquetas.

### 2.7 Policy/RBAC (seguridad por rol)

Uso:

- Centralizar permisos por rol y accion.

Roles:

- Admin
- Invitado
- Salon

## 3) Patrones diferidos (no MVP)

- CQRS completo.
- Event Sourcing.
- Microservicios por defecto.

## 4) Regla de oro para MVP

Aplicar patrones solo donde aporten claridad real.
Si no reducen complejidad, no se aplican todavia.

## 5) Comentarios para principiantes

- **Acoplamiento:** cuando una parte depende demasiado de otra.
- **Desacoplar:** separar responsabilidades para que el sistema sea mas facil de cambiar.
- **Sobreingenieria:** agregar complejidad sin beneficio real en la fase actual.
