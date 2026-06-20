# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-18
- Uso: leer este documento al retomar el proyecto tras un corte.

## Frase clave para Cursor

```text
Retomo Taulame. Sprint 02 activo (Opcion B). #22-#25 cerradas (commit 568fb1d). Siguiente: #26 pruebas E2E calidad importacion plano. Arquitectura: Clean Architecture pragmatica (ADR-015). SDD manda.
```

## Estado del proyecto

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) |
| Issue actual | **#26** — E2E calidad importacion de plano |
| Cerradas recientes | #22, #23, #24, #25 |
| Ultimo commit | `568fb1d` |

## Secuencia Sprint 02

1. ~~#22–#25~~ cerradas
2. **#26** E2E calidad importacion — **siguiente**
3. #27–#31 Excel
4. #32–#36 Preferencias

## Comandos utiles

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```
