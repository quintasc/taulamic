# Sprint 07 — Guía para revertir cambios UX

- **Objetivo:** poder deshacer una MEJ concreta sin perder el resto del sprint.
- **Estrategia:** **un commit por MEJ (o sub-fase)** con mensaje `feat(MEJ-XX): …`

## Commits previstos (orden)

| Orden | Commit esperado | Revertir solo esta MEJ |
|-------|-----------------|------------------------|
| 1 | `feat(MEJ-10): mesas inline, chips outline, hover filas` | `git revert <hash-me j-10>` |
| 2 | `feat(MEJ-11): dashboard CTA y checklist clicable` | `git revert <hash-mej-11>` |
| 3 | `feat(MEJ-12): marcadores compactos plano` | `git revert <hash-mej-12>` |
| 4 | `feat(MEJ-13): microcopy acordado` | `git revert <hash-mej-13>` |

## Cómo probar antes de merge

1. Implementación en `main` local (o rama `sprint-07/mej-XX` si prefieres PRs separados).
2. Validar pantalla afectada con guion post-implementación.
3. Si no gusta → `git revert` del commit concreto (no mezclar MEJ en un solo commit).

## Pre-trabajo ya en main (no revertir salvo necesidad)

| Commit | Contenido |
|--------|-----------|
| `bab758c` | Feedback opaco (parcial MEJ-10-B) |
| `d5bd3da` | Responsive distribución |
| `3841a29` / `36e889d` | Footer setup |

## PO validación

Guiones propuesta MEJ-10…13 marcados OK — 2026-06-21.
