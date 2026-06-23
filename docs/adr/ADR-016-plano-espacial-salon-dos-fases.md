# ADR-016 - Plano espacial del salon (dos fases)

- Estado: **Aceptado**
- Fecha: 2026-06-23
- Supersede **parcial** de: `ADR-010-importacion-plano-imagen-pdf.md` (flujo principal de producto)
- Documentos actualizados: `SDD-01D-importacion-plano-salon.md`, `SDD-01-borrador-mvp.md` (§2.1, Flujo G, HU-12)
- Handoff: `docs/ux/handoff-figma-a-frontend.md` §5 y § Admin — Plano

## Contexto

El SDD-01 y `ADR-010` definian el plano como **importacion de imagen/PDF para autoconfigurar mesas** (deteccion de mesas, confianza, correccion, confirmacion).

En validacion manual de junio 2026 (handoff UX) se constato que:

- En salones grandes el plano **no es fiable** para inferir numero, forma y capacidad de cada mesa.
- El organizador necesita definir **el espacio del salon** (forma, medidas, zonas) y **colocar despues** las mesas ya calculadas por el motor de distribucion.
- La API de deteccion de mesas (`POST .../floor-plans` + `detect`) sigue existiendo por trabajo previo (EP-11), pero **no es el camino principal de producto** en piloto ni en la vision acordada.

Sin este ADR, la implementacion web (Fase A/B) entraba en conflicto con `SDD-01D` y `HU-12` tal como estaban escritos.

## Decision

El **plano del salon** pasa a tener **dos fases** funcionales:

| Fase | Cuando | Proposito | Pantalla |
|------|--------|-----------|----------|
| **A — Configuracion del espacio** | Antes / durante setup (sin distribucion obligatoria) | Definir forma del salon, medidas en metros, fondo opcional, accesorios (pista, escenario, etc.) | `/admin/events/{id}/floor-plan` |
| **B — Layout de mesas calculadas** | Tras calcular distribucion | Visualizar mesas del motor sobre el perimetro del salon; consultar invitados por mesa; **post-MVP:** drag-drop y guardar posiciones | `/admin/events/{id}/floor-plan/layout` |

### Fase A — Alcance funcional

- Formas: **rectangular**, **redonda**, **ovalada** (sin forma «cuadrada» independiente; equivale a rectangular con mismas medidas).
- Medidas en metros sincronizadas con redimensionado visual en canvas (tirador).
- **Fondo opcional** (JPG/PNG/PDF): capa visual del espacio; la IA futura detectara **contorno del salon**, no lista de mesas.
- **Accesorios**: catalogo seleccionable; en piloto pueden marcarse en lista; **arrastre al canvas** es post-piloto.
- Persistencia piloto: `localStorage` por `eventId` (sin endpoint dedicado).
- CTA «Guardar y continuar» persiste y avanza en el flujo de setup.

### Fase B — Alcance funcional

- Mesas proceden de `GET .../distribution` + configuracion de mesas del evento; **no** de deteccion IA del plano.
- Estados visuales coherentes con Distribucion: llena / en uso / vacia.
- Clic en mesa muestra invitados asignados (panel sobre canvas y/o sidebar).
- **Post-MVP (explicitamente fuera de piloto julio):** arrastrar mesas, rotacion, `POST` guardar posiciones `(x, y, rotation)` por mesa.

### Lo que NO es el camino principal

- Subir plano → detectar mesas → «Corregir plano» → confirmar mesas como **unico** flujo de configuracion.
- La deteccion de mesas de la API EP-11 queda como **capacidad tecnica legacy** / E2E; no se elimina en este ADR, pero **no se exige** en UI piloto.

## Motivos de la decision

- Alinea producto con uso real en bodas y salones grandes.
- Separa **geometria del espacio** de **asignacion de invitados** (motor + mesas en API).
- Permite avanzar el piloto UI sin bloquear por precision de vision en mesas.
- Mantiene fallback manual de mesas en pantalla **Mesas** (HU-01).

## Consecuencias positivas

- Flujo mas claro: Configurar salon → Mesas → Invitados → Distribucion → Ver en plano.
- Implementacion actual (`floor-plan-setup`, `floor-plan/layout`, commit `0f15b37`) queda **justificada** frente al SDD.
- Reduce riesgo de errores por autodeteccion incorrecta de mesas.

## Consecuencias negativas

- ~~Desalineacion temporal con textos antiguos~~ — mitigado (jun 2026): PRD, agile, UX y SDD secundarios alineados con `ADR-016`.
- Requiere endpoint y modelo de persistencia del layout de salon (Fase A) y posiciones de mesas (Fase B) en fase posterior.
- EP-11 en backlog queda **parcialmente obsoleto** como prioridad de producto (la API puede seguir para tests).

## Relacion con ADR-010

| ADR-010 (2026-06-17) | ADR-016 (2026-06-23) |
|----------------------|----------------------|
| Importacion asistida para **proponer mesas** | Importacion opcional de **fondo**; mesas siempre en pantalla Mesas |
| Confirmacion de detecciones de mesas | Confirmacion del **espacio** del salon (Fase A) |
| Camino principal de onboarding | Camino principal: forma + medidas + mesas manuales/API |

`ADR-010` permanece en historial; su flujo de deteccion de mesas **no se implementa como UI principal** salvo decision futura explicita.

## Criterios de aceptacion (piloto julio)

- [x] Fase A: forma, medidas, redimensionar, persistencia local, auto-guardado.
- [x] Fase B: perimetro del salon + mesas con ocupacion y filtros.
- [x] Fase B: clic en mesa muestra invitados asignados.
- [ ] Fase A: subir fondo (JPG/PNG/PDF) — post-piloto o iteracion inmediata.
- [ ] Fase A: accesorios arrastrables al canvas — post-piloto.
- [ ] Fase B: drag-drop y guardar posiciones — post-MVP.
- [ ] Persistencia API del layout de salon — post-piloto.

## Condiciones para revisar esta decision

Reevaluar si:

- la deteccion automatica de mesas alcanza precision operativa (>90% en planos reales) **y** el producto prioriza de nuevo ese atajo, o
- aparece integracion CAD / software de salon que reemplace el canvas manual.

## Comentarios para principiantes

- **Fase A:** dibujar la «caja» del salon, no las mesas de invitados.
- **Fase B:** poner las mesas ya repartidas por el motor encima de esa caja.
- **ADR:** decision arquitectonica/producto registrada; permite cambiar el SDD sin ambiguedad.
