# Glosario para Principiantes (SDD + Web + Agile)

Este glosario explica terminos de forma sencilla, pensado para personas que estan empezando.

## SDD y producto

- **SDD (Spec-Driven Development):** trabajar guiados por especificaciones claras antes de programar en grande.
- **Proteccion del SDD:** regla obligatoria del proyecto; el SDD manda sobre codigo y tests, sin rebajar requisitos para “cerrar rapido”. Ver `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`.
- **No degradacion funcional:** no entregar menos de lo especificado en el SDD para simplificar implementacion o hacer pasar tests.
- **Especificacion:** documento que describe que debe hacer el sistema.
- **MVP:** primera version util, minima pero con valor real.
- **Requisito funcional:** comportamiento que el sistema debe ofrecer.
- **Requisito no funcional:** calidad del sistema (seguridad, rendimiento, disponibilidad).
- **Criterio de aceptacion:** condicion verificable para dar una tarea por valida.
- **ADR:** documento corto de decision tecnica y su motivo.
- **KPI:** metrica clave para saber si se cumple un objetivo.

## Desarrollo web

- **Frontend:** parte visual que usa la persona (botones, formularios, pantallas).
- **Backend:** parte que procesa reglas y devuelve resultados.
- **API:** puerta de comunicacion entre frontend y backend.
- **Endpoint:** URL concreta de una API con un metodo HTTP (GET, POST, etc.).
- **Base de datos:** lugar estructurado donde se guarda informacion.
- **Monolito modular:** una aplicacion unica, separada internamente por modulos.
- **Microservicios:** varias aplicaciones pequenas que se comunican entre si.
- **Worker:** proceso que ejecuta tareas pesadas en segundo plano.
- **Cola de trabajos:** lista de tareas pendientes para workers.
- **Latencia:** tiempo que tarda una respuesta.
- **Concurrencia:** capacidad de atender muchas acciones casi al mismo tiempo.
- **Escalabilidad:** capacidad de crecer sin perder rendimiento.
- **Responsive:** interfaz que se adapta a movil, tablet y escritorio.

## Patrones de diseno

- **Patron de diseno:** solucion reutilizable para un problema comun de software.
- **Strategy:** permite cambiar un algoritmo sin tocar todo el sistema.
- **Specification:** representa reglas como piezas combinables.
- **State:** controla cambios de estado permitidos de una entidad.
- **Repository:** separa logica de negocio de acceso a base de datos.
- **Factory:** crea objetos complejos sin mezclar la creacion con la logica.

## Seguridad y operacion

- **Autenticacion:** comprobar quien eres.
- **Autorizacion:** definir que puedes hacer.
- **RBAC:** autorizacion basada en roles (admin, invitado, salon).
- **Datos sensibles:** informacion que requiere proteccion especial.
- **Auditoria:** registro de acciones para trazabilidad.
- **Backup:** copia de seguridad para recuperar datos.

## API y OpenAPI

- **OpenAPI:** formato estandar para describir APIs REST.
- **Swagger UI:** interfaz web para consultar y probar endpoints.
- **Contrato API:** acuerdo exacto de entrada/salida entre cliente y servidor.
- **DTO:** estructura de datos que viaja por la API.
- **Breaking change:** cambio que rompe clientes existentes.

## Optimizacion combinatoria

- **NP-hard / NP-completo:** tipo de problema donde encontrar el optimo puede ser muy costoso.
- **Funcion objetivo:** formula que dice que significa "mejor solucion".
- **Restriccion dura:** regla que no puede romperse.
- **Restriccion blanda:** preferencia que intenta cumplirse con pesos.
- **Heuristica:** metodo rapido para obtener una buena solucion.
- **Metaheuristica:** estrategia general para mejorar heuristicas.
- **Branch and Bound:** metodo exacto que poda ramas para reducir busqueda.
- **CP-SAT:** solver de restricciones y optimizacion muy usado en problemas complejos.
- **Top-K:** conjunto de las K mejores soluciones encontradas.
- **Algoritmo genetico (GA):** metodo inspirado en evolucion para mejorar soluciones por generaciones.
- **Mutacion:** cambio aleatorio pequeno para explorar nuevas soluciones en GA.

## Invitaciones y experiencia de usuario

- **Invitacion digital:** mensaje enviado al invitado para participar en el evento.
- **RSVP:** confirmacion de asistencia (`si`, `no` o `pendiente`).
- **Benchmark:** referencia de otras apps para aprender buenas practicas.
- **Baja friccion:** completar una accion con pocos pasos y poco esfuerzo.
- **Microcopy:** textos pequenos de la interfaz que guian al usuario.

## Mesas y distribucion

- **Forma de mesa:** geometria fisica de la mesa (redonda, rectangular, etc.).
- **Topologia de asientos:** relaciones entre asientos segun la forma de la mesa.
- **Proximidad relativa:** cercania social entre invitados (al lado, enfrente, mismo lateral).

## Importacion de planos

- **OCR:** tecnologia para leer texto en imagenes o PDFs.
- **Vision por computador:** tecnologia para detectar elementos visuales (por ejemplo, mesas en un plano).
- **Deteccion asistida:** propuesta automatica que luego revisa una persona.
- **Nivel de confianza:** indicador de cuan fiable es una deteccion automatica.

## Precarga de invitados

- **Plantilla Excel:** archivo modelo con columnas esperadas por el sistema.
- **Carga por lote:** importacion de muchos invitados de una sola vez.
- **Validacion por fila:** revisar cada fila y reportar errores exactos para corregir.

## Gobernanza de preferencias

- **Modo colaborativo:** invitados pueden indicar preferencias de asiento.
- **Modo anfitrion_exclusivo:** solo admins controlan afinidades e incompatibilidades.
- **Regla por defecto:** comportamiento aplicado automaticamente salvo excepcion explicita.

## Agile

- **Agile:** forma de trabajo iterativa con entregas frecuentes y feedback continuo.
- **Sprint:** periodo corto de trabajo (normalmente 1-2 semanas).
- **Backlog:** lista priorizada de tareas.
- **User story:** necesidad de usuario expresada en lenguaje simple.
- **Refinamiento:** aclarar tareas antes de implementarlas.
- **Review:** revision del resultado al final del sprint.
- **Retrospectiva:** reunion para mejorar como trabaja el equipo.
- **Definition of Done (DoD):** lista de condiciones para considerar un trabajo terminado.

## Comentario para principiantes

No necesitas memorizar todos los terminos.  
Usa este glosario como referencia rapida mientras avanzas.
