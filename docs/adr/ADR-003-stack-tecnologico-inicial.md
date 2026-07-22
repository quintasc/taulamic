# ADR-003 - Stack tecnologico inicial

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

Se necesita un stack:

- rapido de desarrollar para MVP,
- robusto y seguro,
- capaz de soportar concurrencia,
- con coste razonable para fases iniciales.

## Decision

Se elige el siguiente stack base:

- **Frontend:** Next.js + TypeScript
- **Backend API:** NestJS + TypeScript
- **Base de datos:** PostgreSQL
- **Cola y cache:** Redis + BullMQ
- **Documentos PDF:** generacion server-side (motor PDF en backend/worker)
- **Autenticacion y roles:** JWT + RBAC
  - **Implementacion web (cuando toque):** emitir el JWT en cookie **`HttpOnly`** (+ `Secure` en producción, `SameSite` estricto/lax según flujo), no en `localStorage`. Reduce exfiltración por XSS. API clients no browser pueden seguir con `Authorization: Bearer`.
- **Tests:** Jest (backend) + pruebas e2e web

## Motivos de la decision

- TypeScript reduce errores y ayuda a equipos principiantes con tipado.
- Next.js acelera construccion de interfaz web moderna.
- NestJS aporta estructura clara y modular para backend.
- PostgreSQL es solido para datos relacionales y reglas de negocio.
- Redis + cola permite procesar tareas pesadas sin frenar UX.

## Alternativas evaluadas

- Backend todo en Next.js: mas simple al inicio, pero menos estructurado para dominio complejo.
- Python/FastAPI: muy valido tecnicamente, pero menos alineado a un stack unico TypeScript extremo a extremo.
- Microservicios desde inicio: descartado por complejidad y coste tempranos.

## Consecuencias positivas

- Productividad alta en MVP.
- Escalado progresivo sin redisenar todo.
- Mejor mantenibilidad por separacion clara de responsabilidades.

## Consecuencias negativas

- Dos proyectos principales (frontend y backend) en lugar de uno.
- Requiere disciplina para contrato API y versionado.

## Condiciones para revisar esta decision

Reevaluar cuando:

- cambie el equipo o experiencia tecnica,
- cambie fuerte el volumen o patrones de uso,
- cambien requisitos de coste/plataforma.

## Comentarios para principiantes

- **Stack tecnologico:** conjunto de herramientas usadas para construir la app.
- **RBAC:** permisos por rol (admin, invitado, salon).
- **E2E (end-to-end):** prueba que valida un flujo completo de usuario.
