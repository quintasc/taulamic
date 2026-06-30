# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-21**
- Sprint activo: **07 — Cohesión UX piloto (MEJ-10 → MEJ-13)**
- **`main` @ `a4fee82`** (5 commits por delante de `origin/main`, **sin push**)

## Frase clave

```text
Retomo Taulamic. Sprint 07: validar manualmente MEJ-10/11/12/13, cerrar sprint y push. Pendiente MEJ-10 A y MEJ-13 A (inventario PO). SDD manda.
```

## Estado Sprint 07 (implementación)

| MEJ | Fase | Estado código | Commit(s) |
|-----|------|---------------|-----------|
| MEJ-10 | C | Mesas inline rename + `ConfirmDialog` eliminar | `4890625` |
| MEJ-10 | D | Chips forma mesa (`SelectableChip` / inline select) | `4890625` |
| MEJ-10 | — | Setup journey (checklist visual clicable) | `4890625` |
| MEJ-10 | A | §7.5 feedback contextual + guía | ⏳ Pendiente |
| MEJ-11 | B | CTA dashboard → siguiente paso incompleto | `8a79138` |
| MEJ-11 | C | Checklist setup clicable (`SetupJourney`) | `4890625` |
| MEJ-11 | D | Accesos rápidos **eliminados** (decisión PO sesión; no `lg:hidden`) | `8a79138` |
| MEJ-12 | B | Rejilla fija, escala dinámica, marcadores compactos, accesorios distribuidos, responsive | `fdc8373` |
| MEJ-13 | B+C | Poda microcopy piloto/post-MVP + `ResponsiveButtonLabel` `< md` | `1d3db89` |
| MEJ-13 | A | Inventario microcopy con decisiones PO documentadas | ⏳ Pendiente |
| — | UX | Aviso bloqueo setup compacto encima footer; sync nombre evento al borrar; «Soluciones» visible en móvil (landing) | `a4fee82` |

**Pre-trabajo previo al sprint (ya en historial):** feedback opaco, responsive distribución, footer setup, landing segmentos (`bab758c`…`36e889d`).

## Próximos pasos

1. **Validación manual** con guiones post-implementación (`guion-validacion-mej-10-ui.md` … `-13-ui.md`).
2. **`git push`** de los 5 commits locales.
3. **MEJ-13 A** — completar inventario + decisiones PO en spec si falta cobertura.
4. **MEJ-10 A** — feedback contextual (§7.5) si sigue en alcance P1.
5. **`sprint-07-cierre.md`** + evidencias `evidencias-mej-10-validacion.md` (y 11/12/13).

## Gate PO

Guiones propuesta MEJ-10…13 usados como base de la sesión de implementación. Formalizar aprobación / diferidos en specs al cerrar sprint.

## Commits locales (sin push)

```
a4fee82 fix(web): aviso setup compacto, sync nombre evento y Soluciones en movil
8a79138 feat(web): MEJ-11 CTA en dashboard al siguiente paso incompleto del setup
1d3db89 fix(web): MEJ-13 microcopy piloto y etiquetas responsive en acciones
fdc8373 fix(web): MEJ-12 plano con rejilla fija, escala dinamica y accesorios distribuidos
4890625 Sprint 07 UX: mesas inline, setup journey y chips de forma
```

## Sprint 07 — documentos

| Documento | Uso |
|-----------|-----|
| `sprint-07-plan.md` | Plan activo |
| `sprint-07-guia-revertir-cambios.md` | Flags reversibles setup nav (`SETUP_NAV_*`) |
| `sprint-06-cierre.md` | Sprint anterior |

## MEJ — specs y guiones

| MEJ | Spec | Guion propuesta | Guion validación |
|-----|------|-----------------|------------------|
| MEJ-10 | `MEJ-10-cohesion-ui-feedback-y-tablas.md` | `guion-validacion-mej-10-propuesta-ui.md` | `guion-validacion-mej-10-ui.md` |
| MEJ-11 | `MEJ-11-dashboard-navegacion-y-atajos.md` | `guion-validacion-mej-11-propuesta-ui.md` | `guion-validacion-mej-11-ui.md` |
| MEJ-12 | `MEJ-12-plano-marcadores-compactos.md` | `guion-validacion-mej-12-propuesta-ui.md` | `guion-validacion-mej-12-ui.md` |
| MEJ-13 | `MEJ-13-auditoria-microcopy-y-ayudas.md` | `guion-validacion-mej-13-propuesta-microcopy.md` | `guion-validacion-mej-13-ui.md` |

## Sprint 06 (cerrado)

- Evidencias: `evidencias-mej-08-fase2-validacion.md`
- Cierre: `sprint-06-cierre.md`

## Referencias

- `guia-estilo-taulamic.md`
- `guion-validacion-piloto-ui.md`
- `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`
