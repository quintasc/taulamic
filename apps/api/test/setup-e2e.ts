/**
 * Setup e2e: no fuerza el motor.
 * Usa `DISTRIBUTION_ENGINE` del entorno / `.env` (mismo criterio que `app.config`).
 * Por defecto: `v1` (CP-SAT). Para greedy: `DISTRIBUTION_ENGINE=v0 npm run test:e2e`.
 *
 * `test:e2e` arranca Jest con `--experimental-vm-modules` para permitir el
 * `import()` dinámico de `or-tools-wasm` (CP-SAT).
 */
