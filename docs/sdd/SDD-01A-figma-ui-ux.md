# SDD-01A - Plan de Figma (UX/UI)

## 1) Objetivo

Aterrizar en diseno visual y de interaccion las funcionalidades definidas en SDD-01, para reducir dudas antes de programar.

## 2) Momento correcto dentro de SDD

Figma empieza **antes de cerrar del todo SDD-01** y nunca se deja para el final del desarrollo.

Secuencia recomendada:

1. Definir alcance funcional inicial (SDD-01 borrador).
2. Dibujar flujos en Figma.
3. Crear wireframes de pantallas clave.
4. Revisar con usuarios (admin/invitado/salon).
5. Ajustar SDD-01 con lo aprendido.
6. Pasar a desarrollo.

## 3) Entregables minimos en Figma (MVP)

- Mapa de navegacion (que pantallas existen).
- Flujos principales:
  - alta/configuracion de evento,
  - envio de invitaciones y confirmacion RSVP,
  - formulario de invitado,
  - tablero de distribucion para admin,
  - comparador visual de candidatas Top-K,
  - publicacion a invitados,
  - descarga de documentos.
- Wireframes low-fi por flujo.
- Prototipo clicable basico para validacion.
- Componentes UI base (botones, inputs, tarjetas, tablas/listas).

## 4) Decisiones de UX que impactan funcionalidad

Estas decisiones SI afectan alcance tecnico:

- como mover invitados entre mesas (drag and drop o selector),
- como mostrar conflictos de reglas duras,
- como comparar rapido candidatas sin analizar mesa por mesa,
- como minimizar esfuerzo en envio y respuesta de invitaciones,
- como editar preferencias privadas de forma segura,
- como y cuando mostrar estado de calculo.

Por eso Figma y SDD deben iterar juntos.

## 5) Definition of Ready para pasar a desarrollo

Una historia de usuario esta lista para construir cuando tiene:

- descripcion funcional clara en SDD-01,
- criterios de aceptacion,
- flujo de pantalla en Figma,
- wireframe o mockup de la pantalla objetivo.

Adicional para HU de comparacion de candidatas:

- vista comparativa con score global y score por criterio,
- indicadores de diferencias entre candidatas,
- accion directa para seleccionar candidata base.

Referencia:

- `docs/sdd/SDD-01B-comparacion-visual-candidatas.md`
- `docs/sdd/SDD-01C-principios-estilo-y-baja-friccion.md`

## 6) Direccion visual y tono de interfaz

La propuesta en Figma debe seguir estas directrices:

- sobrio y elegante,
- limpio y poco cargado,
- relajante y amigable,
- alegre sin elementos distractores.

Benchmark de inspiracion:

- PerfectTablePlan
- Planning Pod
- Prismm

## 7) Comentarios para principiantes

- **Wireframe:** esquema simple de pantalla, sin detalle visual final.
- **Mockup:** diseno visual mas cercano al resultado final.
- **Prototipo:** simulacion navegable para probar experiencia.
- **UX:** como se siente y funciona la experiencia de uso.
- **UI:** aspecto visual de esa experiencia.
