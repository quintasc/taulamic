# Roadmap MVP julio — Vista grafica

> **Hoy:** 24 jun 2026 · **Hito piloto:** 31 jul 2026 · **Decision:** [DECISION-002](DECISION-002-mvp-julio-piloto-funcional.md)  
> Plan detallado: [mvp-julio-plan.md](mvp-julio-plan.md) · Estado operativo: [CONTEXTO-EJECUCION.md](CONTEXTO-EJECUCION.md)  
> Commits referencia: `d137a4c` (cierre validacion + Playwright) · `796329b` (clean architecture #43)

## Donde estamos ahora

```
Mar 2026          Jun 2026                              Jul 2026              Ago+
|---- SDD/backlog ----|-- entrega nucleo piloto --|-- cierre y prueba --|-- SDD completo --|
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                       EP-11..13 API UI motor E2E HECHO
                                              ^^^^^^^^^
                                         refinamiento + hito 31 jul
```

| Indicador | Valor |
|-----------|-------|
| **Posicion temporal** | Semana 2 de 6 (23–29 jun) — **nucleo + validacion manual HECHOS** |
| **Foco actual** | Issues post-piloto GitHub; prueba organizador real (jul); estabilizacion menor |
| **EP-11 / EP-12 / EP-13** | **Cerrados** (#22–#36) |
| **EP-01 / EP-02 / motor v0 / E2E / UI / validacion manual** | **Cerrados** |
| **Progreso piloto (DoD)** | **~95 %** — falta #53 prueba organizador real |
| **Dias hasta piloto** | 37 dias |

**Estado por color:** `HECHO` · `EN CURSO` · `PLANIFICADO` · `POSPILOTO`

---

## Diagrama Gantt (MVP julio)

Copia o visualiza este bloque en GitHub, VS Code o [mermaid.live](https://mermaid.live).

```mermaid
gantt
    title Roadmap Taulamic — MVP julio piloto (actualizado 24 jun 2026)
    dateFormat YYYY-MM-DD
    axisFormat %d %b

    section Preparacion
    SDD backlog ADRs sprints     :done, prep, 2026-03-01, 2026-06-17

    section Backend y API (adelantado)
    EP-11 plano API #22-26       :done, ep11, 2026-06-01, 2026-06-20
    Excel EP-12 #27-31           :done, ep12, 2026-06-10, 2026-06-18
    Preferencias EP-13 #32-36    :done, ep13, 2026-06-10, 2026-06-18
    Evento mesas EP-01 #1 #15    :done, ep01, 2026-06-08, 2026-06-16
    Invitados API EP-02 #2       :done, ep02, 2026-06-08, 2026-06-16
    Motor v0 distribucion        :done, motor, 2026-06-12, 2026-06-20
    E2E piloto-flow              :done, e2e, 2026-06-15, 2026-06-20
    OpenAPI piloto #9            :done, oapi, 2026-06-12, 2026-06-18

    section Frontend admin (adelantado)
    UI admin base W5 PR38        :done, w5, 2026-06-10, 2026-06-18
    UI piloto W6 PR39            :done, w6, 2026-06-15, 2026-06-20
    Plano Fase A/B ADR-016       :done, plano, 2026-06-18, 2026-06-22
    Distribucion v2 Dashboard v2 :done, dist, 2026-06-15, 2026-06-20

    section Refinamiento jun 2026
    Flujo setup enmienda jun     :done, setup, 2026-06-19, 2026-06-21
    Invitados alta manual RSVP   :done, guests, 2026-06-19, 2026-06-21
    Colores semanticos piloto    :done, sem, 2026-06-20, 2026-06-21
    Docs ADR-018 019 HU-05       :done, docs, 2026-06-20, 2026-06-21

    section Cierre piloto (W1-W6 restante)
    Validacion manual guion UI   :done, val, 2026-06-18, 2026-06-24
    Playwright E2E + Sentry prep :done, e2ew, 2026-06-22, 2026-06-24
    Issues post-piloto GitHub    :done, gh, 2026-06-24, 2026-06-24
    API persistencia layout      :crit, layout, 2026-06-23, 2026-07-10
    Fondo accesorios canvas      :layout2, 2026-06-25, 2026-07-15
    Estabilizacion y fixes       :crit, fix, 2026-07-14, 2026-07-30
    Prueba piloto usuario real   :crit, test, 2026-07-20, 2026-07-31
    Hito MVP piloto              :milestone, mvp, 2026-07-31, 0d

    section Post-piloto ago+
    HU-05 ajuste manual invitados:post, 2026-08-01, 2026-10-31
    Drag posiciones mesas ADR-016:post2, 2026-08-01, 2026-10-31
    PostgreSQL auth motor EP-08  :post3, 2026-08-01, 2026-12-31
    Top-K RSVP documentos UI     :post4, 2026-08-01, 2026-12-31
```

---

## Linea de tiempo por fases

```mermaid
timeline
    title Hitos Taulamic 2026
    section Hecho
        Mar-Jun : SDD-00 SDD-01 backlog ADRs
        Jun : EP-11..13 Excel preferencias plano API
        Jun : EP-01 EP-02 motor v0 E2E OpenAPI
        Jun : UI admin W5 W6 Distribucion v2 plano Fase A/B
    section En curso (jun)
        24 jun : Validacion manual post-UX HECHA sesion-2026-06-24
        24 jun : Issues post-piloto #44-#52 creadas; #53 prueba organizador
    section Cierre (jul)
        14-31 jul : Estabilizacion prueba piloto real
        31 jul : Hito MVP piloto
    section Post-piloto
        Ago+ : HU-05 drag mesas PostgreSQL auth Top-K RSVP
```

---

## Matriz semanal (estado vivo)

| Semana | Fechas | Entregable clave | Estado |
|--------|--------|------------------|--------|
| **W1** | 18–22 jun | Nucleo piloto + refinamiento UX | **HECHO** |
| **W2** | 23–29 jun | Validacion manual; issues post-piloto | **EN CURSO** — validacion **HECHA** |
| W3 | 30 jun – 6 jul | Cierre huecos plano; checklist setup | Planificado |
| W4 | 7–13 jul | Estabilizacion integracion | Planificado |
| W5 | 14–20 jul | Prueba piloto interna | Planificado |
| W6 | 21–31 jul | Fixes finales; demo usuario real | Planificado |
| Post | ago 2026+ | MVP SDD completo | Pospuesto (SDD intacto) |

---

## Progreso por bloque funcional

```mermaid
pie showData
    title Entregables MVP julio por estado (24 jun)
    "Hecho (nucleo + validacion)" : 18
    "En curso (usuario real jul)" : 1
```

| Bloque | Issues / ambito | Hecho | En curso | Pendiente |
|--------|-----------------|-------|----------|-----------|
| Plano EP-11 | #22–#26 + ADR-016 UI | 5 + Fase A/B | — | API layout, fondo, drag accesorios |
| Excel EP-12 | #27–#31 | 5 | — | — |
| Preferencias EP-13 | #32–#36 | 5 | — | Motor afinidad real (post-piloto) |
| Evento EP-01 | #1, #15 | 2 | — | — |
| Invitados EP-02 | #2 + UI manual | 1 + UI | refinamiento UX | — |
| Distribucion piloto | motor v0, E2E | 2 | — | HU-05 manual (post-piloto) |
| UI admin | W5 + W6 + jun 2026 | 1 + refinamiento | — | — |
| Validacion + E2E UI | guion + Playwright | 2 | — | — |
| Docs gobernanza | ADR-016 018 019 021 | 5 | — | — |

---

## Dos niveles de MVP (referencia rapida)

| Nivel | Fecha objetivo | Que incluye |
|-------|----------------|-------------|
| **MVP julio (piloto)** | **31 jul 2026** | Admin: plano + Excel + evento + invitados + motor v0 + UI minima — **nucleo en `main`** |
| **MVP SDD completo** | Post-piloto | Todo `SDD-01-borrador-mvp.md` — sin rebaja de requisitos |

---

## Como mantener el roadmap al dia

1. Al cerrar una issue GitHub o merge relevante, actualizar la matriz semanal y barras `done` del Gantt.
2. Sincronizar foco activo con [CONTEXTO-EJECUCION.md](CONTEXTO-EJECUCION.md).
3. Si cambia el calendario, editar primero `mvp-julio-plan.md` y luego este archivo (fechas Gantt).
4. Cumplimiento piloto vs SDD-01: `docs/sdd/SDD-PILOTO-alineacion-y-huecos.md`.
