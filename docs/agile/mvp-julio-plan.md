# Plan MVP julio — Piloto funcional (hasta 2026-07-31)

> **Decision:** `DECISION-002-mvp-julio-piloto-funcional.md`  
> **Objetivo:** piloto demostrable con organizador real. **No** sustituye el MVP SDD completo.

## 1) Resultado esperado el 31 de julio

Un admin puede:

1. Crear un evento.
2. Configurar mesas (importando plano o manualmente).
3. Importar invitados por Excel.
4. Elegir modo de preferencias basico.
5. Calcular una distribucion (motor v0).
6. Revisar y confirmar el resultado para el evento piloto.

## 2) Calendario semanal

| Semana | Fechas | Entregables |
|--------|--------|-------------|
| W1 | 18–22 jun | #26 E2E importacion plano; inicio #27–#29 Excel |
| W2 | 23–29 jun | Cerrar #30–#31 Excel; inicio #32–#36 preferencias |
| W3 | 30 jun – 6 jul | Cerrar preferencias; #15 forma mesa; EP-01 evento/mesas API |
| W4 | 7–13 jul | EP-02 invitados API; integracion plano + Excel + evento |
| W5 | 14–20 jul | Frontend admin minimo (Next.js): flujo piloto |
| W6 | 21–31 jul | Motor v0; prueba piloto; fixes; documentacion |

## 3) Orden de ejecucion (issues GitHub)

### Fase A — Captura inteligente (Sprint 02, casi hecho)

1. ~~#22–#25~~ EP-11 base
2. **#26** E2E calidad importacion
3. **#27–#31** Excel
4. **#32–#36** Preferencias
5. **#15** Forma de mesa

### Fase B — Nucleo evento (Sprint 01 pospuesto, version minima)

6. **#1** Evento y mesas (API; UI minima en W5)
7. **#2** Invitados (campos base MVP; sin extras)

### Fase C — Piloto distribucion

8. **Motor v0** (issue a crear o epic EP-03 piloto)
9. **Integracion E2E piloto** (guion + test)

### Explicitamente fuera de julio

- #7 Figma completo
- Top-K, worker, RSVP, documentos, auth completo, PostgreSQL prod

## 4) Definition of Done del MVP julio

- Flujo piloto ejecutado de punta a punta con evidencia.
- `npm run build && npm test && npm run test:e2e` en verde en modulos del piloto.
- OpenAPI actualizado.
- Lista de issues `post-piloto` creada para MVP SDD completo.

## 5) Despues del piloto (agosto 2026+)

Prioridad sugerida para **MVP SDD completo**:

1. PostgreSQL + migraciones
2. Auth JWT/RBAC
3. Motor EP-08 (heuristica + worker)
4. Top-K + comparador (SDD-01B)
5. RSVP (EP-09)
6. Documentos (EP-05)
7. UI invitado/salon + Figma (#7)
8. IA asistiva ampliada (EP-14) donde aporte valor

## 6) Comentarios para principiantes

- **Piloto:** version pequena para aprender con usuarios reales, no la version final.
- **Motor v0:** primera version simple del algoritmo; luego se mejora sin tirar el trabajo del plano/Excel.
- **Post-piloto:** todo lo pospuesto en julio sigue en el SDD; solo cambia el orden.
