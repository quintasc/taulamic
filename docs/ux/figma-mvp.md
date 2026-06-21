# Figma MVP — issue #7

- Estado: **En curso** (Ventana 2)
- Rama: `feat/7-figma-mvp`
- Referencia SDD: `docs/sdd/SDD-01A-figma-ui-ux.md`

## Archivo Figma

| Campo | Valor |
|-------|--------|
| URL | _(pendiente — pegar enlace al crear el archivo)_ |
| Equipo / proyecto | Taulamic |
| Ultima revision | _(fecha)_ |

## Mapa de paginas (MVP piloto julio)

Marcar con `[x]` cuando el flujo tenga wireframe low-fi en Figma.

- [ ] Admin — dashboard / evento
- [ ] Admin — importacion plano + correccion
- [ ] Admin — Excel (plantilla + errores por fila)
- [ ] Admin — modo preferencias
- [ ] Admin — forma de mesa + vista asientos
- [ ] Admin — tablero distribucion (borrador motor v0)
- [ ] Componentes UI base

## APIs disponibles en main (Ventana 2 / Figma)

### Evento y mesas (#1)

- `POST /api/v1/events` — crear evento
- `GET /api/v1/events/:eventId` — evento + mesas + `capacitySummary`
- `POST/PUT/DELETE .../events/:eventId/tables` — CRUD mesas

### Forma mesa (#15)

- `GET /api/v1/events/:eventId/table-shapes` — catalogo de formas
- `GET /api/v1/events/:eventId/table-shapes/:shape/seat-topology?capacity=N` — vista previa
- `GET .../floor-plans/:id/draft/tables/:tableId/seat-topology` — topologia por mesa

Usar estos contratos para la pantalla **forma de mesa + vista previa asientos**.

## Post-piloto (backlog Figma)

RSVP, Top-K comparador, invitado, documentos salon/cocina — ver SDD-01A seccion 3 completa.
