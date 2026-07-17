# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-07-17**
- Sprint activo: **Post Sprint 10** (W5 cierre piloto)
- **`main` @ `9d6fdb0`** (pusheado) — e2e API alineados a `DISTRIBUTION_ENGINE`

## Frase clave

```text
Retomo Taulamic. Estado 2026-07-17: e2e API ya no fuerzan motor v0; usan DISTRIBUTION_ENGINE (default v1 CP-SAT). Suite e2e 66/66 con CP-SAT. Pendiente: decision PO L3 anti-huerfano vs quorum 3; validacion PO visual; deuda sillas/afinidades API.
```

## Entregado hoy 2026-07-17

### E2E API alineados a `DISTRIBUTION_ENGINE`

| Área | Entrega |
|------|---------|
| Setup e2e | `setup-e2e.ts` deja de forzar `DISTRIBUTION_ENGINE=v0` |
| Assertions | `expectedMotorVersion()` según env (`v1`/`cpsat` → `v1-cpsat`, `v0` → `v0-pilot`) |
| Jest + WASM | `test:e2e` con `--experimental-vm-modules` (import dinámico or-tools-wasm) |
| Verificación | Suite e2e API **66/66** con CP-SAT; regresión con `DISTRIBUTION_ENGINE=v0` OK |
| Docs piloto | `docs/pilot/` y Project doc actualizados (E2E = config, no v0 fijo) |

### Docs roadmap (commit previo `aec8ce1`)

| Área | Entrega |
|------|---------|
| Roadmap MVP | Actualizado a 17 jul / W5 (14 días al hito) |
| Contexto | Limpieza historial punteros main |

## Pendiente inmediato

1. **Decision PO L3** — alinear ADR-024 (≥2) vs quorum CP-SAT (≥3 al fragmentar); sin tocar L1/L2
2. **Validación PO visual** — sillas, estrella, móvil (`guion-validacion-piloto-ui.md`)
3. **Deuda técnica piloto** — unificar sillas API/local; persistencia API afinidades

## Historial reciente

| Commit | Descripción |
|--------|-------------|
| `9d6fdb0` | test(api): e2e respetan DISTRIBUTION_ENGINE (CP-SAT por defecto) |
| `aec8ce1` | docs: actualiza roadmap MVP a 17 jul (W5) y limpia historial de contexto |
| `d66a1f8` | docs: fija puntero main en 13b79c7 |
| `13b79c7` | docs: alinea puntero main a HEAD |
| `6f242a8` | refactor(web): hooks/modales compartidos distribución, badge PAX y E2E categoría |
| `50f779d` | docs: sincroniza GitHub Project #2 y contexto tras consolidación piloto |
| `4dd7e39` | docs: consolidate current pilot scope and SDD traceability |
| `9933ce7` | feat(ui): distribución por sillas, estrella presidencial y mejoras panel plano |

## Sprint 10 (cerrado)

- `sprint-10-cierre.md` · Sillas, estrella presidencial, panel plano mejorado

## Sprint 09 (cerrado)

- `sprint-09-cierre.md` · E2E robusto + drawer hamburguesa

## Referencias

- `guion-validacion-piloto-ui.md`
- `docs/pilot/README.md`
- `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`
- `apps/api/.env.example` (`DISTRIBUTION_ENGINE`)
