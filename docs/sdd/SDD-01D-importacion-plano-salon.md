# SDD-01D - Plano espacial del salon

> **Actualizado 2026-06-23** segun `ADR-016-plano-espacial-salon-dos-fases.md`.  
> Sustituye la redaccion anterior centrada en «importacion para autoconfigurar mesas» como flujo principal.

## 1) Objetivo

Permitir al admin definir el **espacio del salon** y, tras la distribucion, **visualizar y ajustar** la disposicion de mesas sobre ese espacio, reduciendo friccion sin depender de detectar cada mesa desde una imagen.

## 2) Alcance funcional (dos fases)

### Fase A — Configuracion del espacio del salon

El sistema debe permitir:

- elegir **forma** del salon: rectangular, redonda u ovalada;
- indicar **medidas** en metros (ancho/largo o radio) con sincronizacion bidireccional con el canvas;
- **redimensionar** visualmente el perimetro (tiradores);
- marcar **accesorios** de referencia (mesa novios, pista de baile, barra, puerta, escenario, entrada);
- opcionalmente (post-piloto inmediato): **subir fondo** JPG/PNG/PDF como capa visual — la IA asistira a delimitar el contorno del espacio, **no** a listar mesas;
- **guardar** la configuracion del salon antes de continuar el setup.

Las **mesas del evento** (forma, capacidad, etiqueta) se configuran en la pantalla **Mesas** (HU-01), no mediante deteccion automatica del plano.

### Fase B — Layout de mesas calculadas (post-distribucion)

Tras `POST .../distribution/run`, el sistema debe permitir:

- mostrar el perimetro del salon (Fase A) y las **mesas de la distribucion calculada**;
- codificar por color el estado de ocupacion (llena / en uso / vacia), coherente con la lista de Distribucion;
- **consultar invitados** asignados a una mesa al seleccionarla;
- filtrar y buscar mesas en el plano;
- **post-MVP:** arrastrar mesas, rotar y **persistir posiciones** `(x, y, rotation)` en API.

## 3) Principio clave

La configuracion del salon es **asistida y editable**; la asignacion de invitados a mesas es responsabilidad del **motor de distribucion** y de ajustes manuales (HU-05), no de la vision por imagen sobre mesas individuales.

La deteccion automatica de mesas desde imagen (flujo legacy `ADR-010` / API EP-11) **no es el camino principal de producto** salvo decision futura explicita.

## 4) Flujo recomendado

### Fase A

1. Admin abre «Plano del salon».
2. Define forma y medidas (canvas + sidebar).
3. Opcional: sube fondo del salon (post-piloto).
4. Opcional: coloca accesorios (lista; arrastre al canvas post-piloto).
5. Guarda y continua (invitados / mesas / preferencias segun checklist).

### Fase B

1. Admin calcula distribucion.
2. Desde Distribucion, «Ver en plano» o equivalente.
3. Revisa mesas sobre el perimetro; pulsa mesa para ver invitados.
4. Post-MVP: reposiciona mesas y guarda layout.

## 5) Reglas de calidad

- Si no hay distribucion calculada, Fase B muestra estado vacio con enlace a Distribucion.
- Si falla la carga del fondo o la IA de contorno, el admin puede seguir solo con forma geometrica.
- Nunca se bloquea el evento por fallo de importacion visual.
- Debe existir trazabilidad de origen del layout de salon: `manual` | `importado_fondo_editado` (cuando exista API).

## 6) Datos minimos del layout de salon (Fase A)

- `shape`: rectangular | round | oval
- `widthM`, `lengthM` (rectangular / ovalada)
- `radiusM` (redonda)
- `placedAccessories`: identificadores de accesorios
- `backgroundAssetId` (opcional, post-API)
- `accessoryPositions` (opcional, post-piloto)

## 7) Datos minimos por mesa en plano (Fase B, post-MVP)

- `tableId`
- `x`, `y`, `rotation` (coordenadas normalizadas o en metros segun ADR de persistencia)
- referencia a etiqueta y ocupacion desde distribucion (lectura)

## 8) Criterios de aceptacion UX

### Piloto julio (minimo)

- Un admin define forma y medidas del salon en menos de 3 minutos sin subir archivo.
- Tras calcular distribucion, ve las mesas dentro del perimetro y puede leer invitados por mesa con un clic.
- Los errores de datos (mesa sin invitados, distribucion ausente) muestran mensajes claros.

### Post-MVP

- Reposicionar mesas con drag-drop y guardar en menos de 5 minutos para un evento medio.
- Fondo opcional mejora la orientacion sin sustituir la forma geometrica editable.

## 9) Referencias

- `docs/adr/ADR-016-plano-espacial-salon-dos-fases.md`
- `docs/ux/handoff-figma-a-frontend.md` § Admin — Plano
- API legacy deteccion mesas: modulos `floor-plans` (EP-11) — no UI principal

## 10) Comentarios para principiantes

- **Plano del salon:** la «habitacion», no la lista de invitados sentados.
- **Ver en plano:** mapa despues de calcular quien va en cada mesa.
- **ADR-016:** explica por que ya no pedimos «sube foto y detecta 40 mesas» como paso obligatorio.
