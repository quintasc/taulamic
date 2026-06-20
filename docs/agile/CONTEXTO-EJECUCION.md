# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-18
- Hito activo: **MVP julio (piloto)** — ver `DECISION-002-mvp-julio-piloto-funcional.md`

## Frase clave para Cursor

```text
Retomo Taulame. MVP julio piloto (31 jul). Sprint 02 activo. EP-12 en curso (#27-#28 hechas). Siguiente: #29 importador por lote. Objetivo piloto: plano+Excel+evento+invitados+motor v0+UI admin minima. SDD completo post-piloto. DECISION-002. SDD manda.
```

## Dos niveles de MVP (no confundir)

| Nivel | Que es | Cuando |
|-------|--------|--------|
| **MVP julio (piloto)** | Flujo admin demostrable en evento real | **2026-07-31** |
| **MVP SDD completo** | Todo `SDD-01-borrador-mvp.md` | Post-piloto (ago 2026+) |

## Estado actual

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) |
| Issue actual | **#29** (importador por lote) |
| EP-11 progreso | **#22–#26 cerradas** |
| EP-12 progreso | **#27–#28 cerradas** (plantilla + parser) |
| Plan detallado | `docs/agile/mvp-julio-plan.md` |
| Roadmap grafico | `docs/agile/roadmap-mvp-julio.md` (Gantt + fechas) |

## Proximas 2 semanas (W1–W2)

1. **#29** Importador por lote invitados
2. **#30–#31** Sugerencias y E2E precarga Excel
3. **#32–#36** Preferencias (si W1 va bien)

## Comandos utiles

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```
