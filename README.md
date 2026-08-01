# Taulamic

**Distribucion inteligente de mesas para eventos.**

Taulamic es una aplicacion web que ayuda a organizar la distribucion de invitados en mesas (bodas, cenas de empresa, aulas y escenarios similares), teniendo en cuenta capacidad, acompanantes, afinidades e incompatibilidades. Este repositorio contiene el codigo del piloto, la especificacion (SDD) y la documentacion Agile/ADR del proyecto.

- **Marca:** Taulamic
- **Dominio registrado:** `taulamic.com`
- **Repositorio:** [quintasc/taulamic](https://github.com/quintasc/taulamic)
- **Mercado inicial:** Espana
- **GitHub Project:** [Taulamic](https://github.com/users/quintasc/projects/2)

## Empieza aquí (mapa de docs)

Índice por rol y qué se actualiza solo: **[`docs/README.md`](docs/README.md)**.

- Arquitectura operativa del piloto (cliente/API/motor/persistencia): [`docs/arquitectura/arquitectura-operativa-piloto.md`](docs/arquitectura/arquitectura-operativa-piloto.md)
- Contrato OpenAPI versionado: [`docs/api/openapi.json`](docs/api/openapi.json) — regenerar con `npm run docs:openapi` (CI comprueba que no esté desfasado respecto al código)

## Acceso al piloto

El piloto esta desplegado y accesible en:

- **Aplicacion:** [Piloto en produccion](https://taulamic.alumnes-monlau.com/)
- **Video explicativo del piloto:** [Video del piloto](https://monlaues-my.sharepoint.com/:v:/g/personal/quintasc_monlau_com/IQCg_nzxvrJnSpKRlfhX2-pWAfq5Q2Sho7dRHnqAS1W60Mk?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=UhTkyr)
- **Presentacion (PPT) usada en la defensa:** [Presentacion PPT](https://monlaues-my.sharepoint.com/:p:/g/personal/quintasc_monlau_com/IQCSp8oqymqnSa-eVZQ26InAAZgSNktyQDMQa9fzqPS6-YE?e=SeUZa6)
- **OpenAPI (servidor):** [Documentacion OpenAPI](https://taulamic.alumnes-monlau.com/api/docs)

### Usuario y contrasena de prueba

El piloto **no tiene login**. El acceso es directo al panel organizador (actor admin por cabecera interna). No hay usuario ni contrasena de prueba.

### Material de prueba y evidencias

- **Excel de invitados (80 filas)** para importar en el flujo piloto: [`docs/pilot/invitados-piloto-80.xlsx`](docs/pilot/invitados-piloto-80.xlsx)
- **Ejemplo de informe PDF** generado por Taulamic tras una distribucion: [`docs/pilot/evidencias/informe-distribucion-ejemplo-2026-07-20.pdf`](docs/pilot/evidencias/informe-distribucion-ejemplo-2026-07-20.pdf)

## Stack tecnologico

| Area | Tecnologias |
|------|-------------|
| Lenguaje | TypeScript (frontend y backend) |
| Frontend | Next.js, React, Tailwind CSS, jsPDF |
| Backend / API | NestJS, REST, OpenAPI, class-validator, ExcelJS |
| Motor | CP-SAT (OR-Tools via `or-tools-wasm`), motor v0 como alternativa por configuracion |
| Datos (piloto) | Repositorios JSON y ficheros en `uploads/` (volumen Docker en servidor) |
| Calidad | Jest, Supertest, Playwright, smokes; Sentry opcional |
| Despliegue piloto | Ubuntu, Docker Compose, Nginx (Plesk), HTTPS |

Detalle de decisiones: `docs/adr/ADR-003-stack-tecnologico-inicial.md`.

## Funcionalidades principales (piloto)

- Crear y configurar un evento (admin unico).
- Definir espacio del salon y mesas (forma, capacidad, plano).
- Importar invitados por Excel y alta manual.
- Definir afinidades, incompatibilidades y reglas blandas (p. ej. agrupar por categoria).
- Calcular distribucion con motor CP-SAT (async, con progreso) y ajuste manual de asientos.
- Confirmar propuesta y descargar informe PDF (generado en el navegador).
- Documentacion OpenAPI de la API.

Alcance evaluable y limitaciones: `docs/pilot/README.md` y `docs/pilot/ALCANCE-ACTUAL.md`.

## Estructura del proyecto

```text
taulamic/
├── apps/
│   ├── api/          # Backend NestJS (API, motor, persistencia piloto)
│   └── web/          # Frontend Next.js (admin piloto)
├── docs/             # SDD, ADR, Agile, piloto, UX, arquitectura
├── package.json      # Scripts de monorepo (dev, install:apps, …)
└── README.md
```

- Convencion: Clean Architecture pragmatica por modulo/feature (`docs/adr/ADR-015-clean-architecture-pragmatica-y-features.md`).
- Inventario documental detallado: seccion **Estructura inicial** mas abajo.

## Instalacion y ejecucion (local)

### Arrancar todo (recomendado)

Desde la **raiz** del repositorio:

```bash
npm install
npm run install:apps   # primera vez, o tras cambios de dependencias
npm run dev
```

- API: `http://localhost:3000/api/v1` · OpenAPI: `http://localhost:3000/api/docs`
- Web: `http://localhost:3001` (proxy `/api/v1` → API)

Solo API o solo web: `npm run dev:api` · `npm run dev:web`

### Arrancar por app (alternativa)

**API:**

```bash
cd apps/api
npm install
npm run start:dev
```

**Web admin piloto:**

```bash
cd apps/web
npm install
npm run dev:clean
```

(`dev:clean` en web borra `.next` antes de arrancar; recomendado en OneDrive.)

- Handoff UX: `docs/ux/handoff-figma-a-frontend.md`

## Despliegue del piloto (servidor Monlau)

Resumen del proceso seguido en el servidor Linux del centro:

1. **Clonar / copiar** el repositorio al servidor (`git clone https://github.com/quintasc/taulamic.git`).
2. **Entorno:** Ubuntu con Docker, Docker Compose, Nginx y Plesk. El proyecto corre en contenedores para aislarlo del resto de apps del host.
3. **Dominio / carpeta:** ruta del vhost alineada con el nombre correcto del dominio (`taulamic.alumnes-monlau.com`), gestionado con Plesk.
4. **Contenedores (Compose):**
   - API NestJS: build TypeScript y arranque en puerto interno **3000**.
   - Web Next.js: build de produccion y arranque en puerto interno **3001**.
   - Publicacion solo en localhost del servidor: `127.0.0.1:3100` (API) y `127.0.0.1:3101` (web). No se exponen a Internet; Nginx hace de puerta.
   - Reinicio automatico de contenedores si caen o reinicia el servidor.
5. **Datos persistentes:** volumen Docker para que eventos, invitados, planos, etc. no se pierdan al reconstruir imagenes.
6. **Arranque tipico** (en la carpeta del dominio, con el compose de produccion del servidor):

```bash
docker compose -f compose.production.yml up -d --build
```

7. **Nginx:** HTTPS del dominio → web (`3101`); `/api/docs` → API (`3100`); la web proxyfica `/api/v1` hacia la API. Timeout de proxy ampliado porque el calculo de distribucion puede tardar minutos.
8. **Comprobaciones:** home, API, OpenAPI, certificado HTTPS, DNS y contenedores activos.

URL publica resultante: [https://taulamic.alumnes-monlau.com/](https://taulamic.alumnes-monlau.com/).

> Nota: el fichero `compose.production.yml` y la config Nginx del host viven en el servidor de despliegue; el desarrollo local sigue con `npm run dev` (seccion anterior).

## Objetivo del repositorio

Este repositorio guarda decisiones de producto y tecnologia antes de programar en grande, usando enfoque SDD (Spec-Driven Development), junto con el codigo del piloto evaluable.

**Regla obligatoria:** el SDD es la fuente de verdad funcional. Ver `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`.

## Documentacion vigente del piloto

Mapa de entrada: [`docs/README.md`](docs/README.md).

La referencia actual para evaluacion y docencia se encuentra en:

- `docs/pilot/README.md`
- `docs/pilot/ALCANCE-ACTUAL.md`
- `docs/pilot/EVOLUCION-DEL-ALCANCE.md`
- `docs/pilot/TRAZABILIDAD.md`
- `docs/arquitectura/arquitectura-operativa-piloto.md`
- `docs/api/openapi.json` (contrato exportado; ver workflow OpenAPI en CI)

El SDD inicial y las enmiendas se conservan como historial de evolucion. La carpeta `docs/pilot` consolida el alcance real actualmente evaluable.

## Para quien esta pensado este contenido

- Personas muy principiantes en SDD.
- Personas muy principiantes en desarrollo web.
- Personas muy principiantes en metodologias Agile.

## Estructura inicial

- `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`: regla obligatoria de proteccion del SDD y no degradacion funcional.
- `docs/sdd/SDD-00-vision-y-estrategia.md`: contexto, segmento objetivo y KPIs.
- `docs/sdd/SDD-01-borrador-mvp.md`: alcance MVP, historias y criterios de aceptacion.
- `docs/sdd/SDD-01A-figma-ui-ux.md`: cuando y como usar Figma dentro de SDD.
- `docs/sdd/SDD-01B-comparacion-visual-candidatas.md`: como comparar rapido Top-K candidatas.
- `docs/sdd/SDD-01C-principios-estilo-y-baja-friccion.md`: direccion visual y criterios UX de uso simple.
- `docs/sdd/SDD-01D-importacion-plano-salon.md`: carga asistida de plano desde imagen/PDF.
- `docs/sdd/SDD-01E-precarga-invitados-excel.md`: plantilla y carga masiva de invitados por Excel.
- `docs/sdd/SDD-03-ia-asistiva-priorizada.md`: oportunidades IA priorizadas con guardarrailes.
- `docs/sdd/SDD-02-backlog-inicial.md`: backlog base para convertir SDD en Issues.
- `docs/product/PRD-v1.md`: PRD consolidado (formato unico tipo workshop).
- `docs/product/matriz-modo-preferencias.md`: guia de eleccion entre modo colaborativo o exclusivo.
- `docs/product/especificacion-plantilla-excel-v1.md`: columnas y validaciones exactas para importacion.
- `docs/adr/ADR-001-tipo-app-web-primero.md`: decision sobre tipo de app inicial.
- `docs/adr/ADR-002-arquitectura-monolito-modular-worker.md`: decision de arquitectura.
- `docs/adr/ADR-003-stack-tecnologico-inicial.md`: decision de stack base.
- `docs/adr/ADR-004-patrones-diseno-mvp.md`: decision de patrones de diseno para MVP.
- `docs/adr/ADR-005-documentacion-api-openapi-nestjs.md`: decision de contrato API y docs OpenAPI.
- `docs/adr/ADR-006-estrategia-optimizacion-motor-asignacion.md`: decision de estrategia del motor NP-hard.
- `docs/adr/ADR-007-top-k-soluciones-candidatas.md`: decision de conservar mejores candidatas antes de aprobar.
- `docs/adr/ADR-008-alcance-invitaciones-rsvp-y-principios-ux.md`: decision de alcance funcional y direccion UX.
- `docs/adr/ADR-009-forma-mesa-y-topologia-de-asientos.md`: decision sobre geometria de mesas y cercania real.
- `docs/adr/ADR-010-importacion-plano-imagen-pdf.md`: decision de importacion automatica asistida.
- `docs/adr/ADR-011-precarga-invitados-excel-estandar.md`: decision de precarga de invitados por lote.
- `docs/adr/ADR-012-modo-control-preferencias-y-regla-acompanantes.md`: decision de gobernanza de preferencias por evento.
- `docs/adr/ADR-013-ia-asistiva-en-producto.md`: decision de uso de IA como asistencia.
- `docs/adr/ADR-014-evaluacion-ga-complementario.md`: decision de evaluar GA por benchmark.
- `docs/adr/ADR-015-clean-architecture-pragmatica-y-features.md`: Clean Architecture pragmatica y modulos por feature.
- `docs/arquitectura/arquitectura-operativa-piloto.md`: como corre el piloto (cliente, API, motor async, persistencia JSON).
- `docs/arquitectura/patrones-diseno-mvp.md`: guia practica de patrones en este dominio.
- `docs/api/openapi.json`: contrato OpenAPI exportado (mantener con `npm run docs:openapi`).
- `docs/README.md`: mapa "empieza aqui".
- `docs/arquitectura/estudio-estrategia-optimizacion-asientos.md`: disertacion comparativa IA vs optimizacion clasica.
- `docs/arquitectura/comparativa-ga-sa-cpsat.md`: protocolo comparativo entre estrategias.
- `docs/arquitectura/decision-motor-para-principiantes.md`: explicacion sencilla de la decision del motor.
- `docs/api/openapi-nestjs-guia.md`: guia de documentacion API para NestJS.
- `docs/glosario/glosario-principiantes.md`: terminos explicados de forma simple.
- `docs/agile/agile-para-principiantes.md`: guia basica de Agile para este proyecto.
- `docs/agile/politica-validacion-tests-y-cobertura.md`: criterios profesionales para aceptar tests, cobertura y cierre de tareas.
- `docs/agile/DECISION-001-sprint-01-pospuesto-opcion-b.md`: decision vigente de ejecucion (Sprint 01 pospuesto, Sprint 02 activo).
- `docs/agile/DECISION-002-mvp-julio-piloto-funcional.md`: hito piloto 31 jul (alcance acotado; SDD completo post-piloto).
- `docs/agile/mvp-julio-plan.md`: plan semanal hasta el piloto funcional.
- `docs/agile/CONTEXTO-EJECUCION.md`: punto de reanudacion rapido (estado, siguiente accion, frase para Cursor).
- `docs/agile/sprint-01-plan.md`: plan de trabajo y cierre para Sprint 01.
- `docs/agile/sprint-02-plan.md`: plan de trabajo para Sprint 02 (configuracion inteligente y captura asistida).

## Como usar este repositorio

1. Leer `SDD-GOVERNANZA-PROTECCION-SDD` antes de implementar o escribir tests.
2. Leer `politica-validacion-tests-y-cobertura` para saber cuando un cambio se acepta tecnicamente.
3. Leer `SDD-00` para entender problema, estrategia y objetivos.
4. Leer `PRD-v1` para vista ejecutiva consolidada.
5. Leer `SDD-01` para revisar funcionalidades y reglas de MVP.
6. Revisar `SDD-01A` para preparar flujos/pantallas en Figma.
7. Revisar `SDD-01B` para definir comparacion visual de candidatas.
8. Revisar `SDD-01C` para estilo visual y baja friccion.
9. Revisar `SDD-01D` para importacion de plano del salon.
10. Revisar `SDD-01E` para precarga de invitados con plantilla Excel.
11. Revisar `SDD-03` para estrategia de IA asistiva.
12. Revisar `SDD-02` para pasar funcionalidades a Issues.
13. Revisar ADRs para entender decisiones tecnicas ya tomadas.
14. Revisar estudio de optimizacion y ADR-006 antes de implementar el motor.
15. Revisar guia de arquitectura y API antes de implementar backend.
16. Consultar glosario cuando aparezca un termino desconocido.
17. Actualizar documentos con Pull Requests pequenos y claros.

## Nota para principiantes

No hace falta entender todo al principio. Lo importante es mantener una idea:

- Primero definimos bien el problema.
- Luego escribimos reglas y decisiones.
- Despues construimos la aplicacion.

Ese orden ahorra tiempo, errores y retrabajo.
