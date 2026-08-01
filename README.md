# TAULAMIC

**Distribución inteligente de mesas para eventos.**

Aplicación web que ayuda a organizar invitados en mesas (bodas y eventos similares), teniendo en cuenta capacidad, acompañantes, afinidades e incompatibilidades. Este repositorio contiene el código del **piloto evaluable**, la especificación (SDD) y la documentación del proyecto.

| | |
|---|---|
| **Marca** | Taulamic |
| **Dominio** | `taulamic.com` |
| **Repositorio** | [quintasc/taulamic](https://github.com/quintasc/taulamic) |
| **Mercado inicial** | España |
| **Piloto** | [taulamic.alumnes-monlau.com](https://taulamic.alumnes-monlau.com/) |
| **Planificación** | [GitHub Project](https://github.com/users/quintasc/projects/2) |
| **Docs (mapa)** | [`docs/README.md`](docs/README.md) |
| **Agentes / desarrolladores** | Empieza por [`AGENTS.md`](AGENTS.md) y [`docs/README.md`](docs/README.md) |

## Qué es TAULAMIC

Organizar a mano quién se sienta con quién en un evento grande consume tiempo y suele generar conflictos: capacidad de mesa, parejas o grupos que deben ir juntos, afinidades e incompatibilidades.

TAULAMIC propone un flujo de organizador para configurar el evento, cargar invitados, definir mesas y preferencias, calcular una distribución y revisarla antes de confirmarla.

- **Uso actual del piloto:** bodas y eventos con panel de organizador (admin).
- **Posibles aplicaciones futuras** (no implementadas como verticales propias del piloto): cenas de empresa, aulas u otros escenarios con asignación a mesas. Ver visión de producto en [`docs/sdd/SDD-00-vision-y-estrategia.md`](docs/sdd/SDD-00-vision-y-estrategia.md) y alcance real en [`docs/pilot/`](docs/pilot/).

## Probar el piloto

- **Aplicación:** [Piloto en producción](https://taulamic.alumnes-monlau.com/)
- **Vídeo explicativo:** [Vídeo del piloto](https://monlaues-my.sharepoint.com/:v:/g/personal/quintasc_monlau_com/IQCg_nzxvrJnSpKRlfhX2-pWAfq5Q2Sho7dRHnqAS1W60Mk?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=UhTkyr)
- **Presentación (PPT) de la defensa:** [Presentación PPT](https://monlaues-my.sharepoint.com/:p:/g/personal/quintasc_monlau_com/IQCSp8oqymqnSa-eVZQ26InAAZgSNktyQDMQa9fzqPS6-YE?e=SeUZa6)
- **OpenAPI (servidor):** [Documentación OpenAPI](https://taulamic.alumnes-monlau.com/api/docs)

El piloto **no tiene login**. El acceso es directo al panel organizador (actor admin por cabecera interna). No hay usuario ni contraseña de prueba.

**Material de prueba:**

- Excel de invitados (80 filas): [`docs/pilot/invitados-piloto-80.xlsx`](docs/pilot/invitados-piloto-80.xlsx)
- Ejemplo de informe PDF: [`docs/pilot/evidencias/informe-distribucion-ejemplo-2026-07-20.pdf`](docs/pilot/evidencias/informe-distribucion-ejemplo-2026-07-20.pdf)

## Qué permite hacer actualmente

Flujo admin de punta a punta del piloto:

1. Crear y configurar el evento.
2. Importar invitados (Excel) o alta manual; definir mesas y plano del salón.
3. Configurar afinidades, incompatibilidades y reglas blandas.
4. Calcular la distribución (CP-SAT por defecto, asíncrono con progreso).
5. Revisar y ajustar asientos a mano; confirmar y descargar el informe PDF (generado en el navegador).

Detalle, limitaciones y lo que queda fuera (Top-K, RSVP, auth JWT, PostgreSQL, cola BullMQ, etc.): [`docs/pilot/README.md`](docs/pilot/README.md) y [`docs/pilot/ALCANCE-ACTUAL.md`](docs/pilot/ALCANCE-ACTUAL.md).

## Cómo funciona

```text
evento → invitados → mesas y plano → afinidades y reglas
       → CP-SAT → revisión manual → confirmación → PDF
```

El motor **CP-SAT** (por defecto) asigna primero a **mesas** y después a **sillas**. El cálculo es asíncrono en el proceso de la API (sin cola externa). Persistencia del piloto: ficheros JSON en `uploads/`. Resumen técnico: [`docs/arquitectura/arquitectura-operativa-piloto.md`](docs/arquitectura/arquitectura-operativa-piloto.md).

## Stack y arquitectura

| Área | Tecnologías |
|------|-------------|
| Lenguaje | TypeScript (frontend y backend) |
| Frontend | Next.js, React, Tailwind CSS, jsPDF |
| Backend / API | NestJS, REST, OpenAPI, class-validator, ExcelJS |
| Motor | CP-SAT (OR-Tools vía `or-tools-wasm`); motor v0 como alternativa por configuración |
| Datos (piloto) | Repositorios JSON y ficheros en `uploads/` (volumen Docker en servidor) |
| Calidad | Jest, Supertest, Playwright, smokes; Sentry opcional |
| Despliegue piloto | Ubuntu, Docker Compose, Nginx (Plesk), HTTPS |

```text
taulamic/
├── apps/
│   ├── api/     # Backend NestJS (API, motor, persistencia piloto)
│   └── web/     # Frontend Next.js (admin piloto)
├── docs/        # SDD, ADR, Agile, piloto, UX, arquitectura
├── package.json # Scripts del monorepo
└── README.md
```

- Arquitectura operativa: [`docs/arquitectura/arquitectura-operativa-piloto.md`](docs/arquitectura/arquitectura-operativa-piloto.md)
- Clean Architecture pragmática: [`docs/adr/ADR-015-clean-architecture-pragmatica-y-features.md`](docs/adr/ADR-015-clean-architecture-pragmatica-y-features.md)
- Stack y demás decisiones: carpeta [`docs/adr/`](docs/adr/)
- Contrato OpenAPI versionado: [`docs/api/openapi.json`](docs/api/openapi.json) (`npm run docs:openapi`; CI comprueba que esté al día)

## Instalación y ejecución local

### Requisitos

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) **20** o superior (incluye `npm`)

### Descargar el proyecto

```bash
git clone https://github.com/quintasc/taulamic.git
cd taulamic
```

(Alternativa: ZIP desde GitHub → *Code* → *Download ZIP*.)

### Arrancar todo (recomendado)

Desde la **raíz** del repositorio:

```bash
npm install
npm run install:apps   # primera vez, o tras cambios de dependencias
npm run dev
```

- Web: `http://localhost:3001` (proxy `/api/v1` → API)
- API: `http://localhost:3000/api/v1`
- OpenAPI: `http://localhost:3000/api/docs`

Solo API o solo web: `npm run dev:api` · `npm run dev:web`

### Arrancar por app (alternativa)

```bash
cd apps/api && npm install && npm run start:dev
```

```bash
cd apps/web && npm install && npm run dev:clean
```

(`dev:clean` borra `.next` antes de arrancar; útil en OneDrive.)

## Despliegue

Resumen del piloto en el servidor Linux del centro (detalle operativo que no está en otro sitio):

1. Clonar o copiar el repositorio (`git clone https://github.com/quintasc/taulamic.git`).
2. Entorno: Ubuntu con Docker, Docker Compose, Nginx y Plesk; la app corre en contenedores.
3. Dominio: `taulamic.alumnes-monlau.com` (vhost con Plesk).
4. Compose: API NestJS (puerto interno **3000**) y web Next.js (**3001**); publicación solo en localhost del host `127.0.0.1:3100` (API) y `127.0.0.1:3101` (web); Nginx es la puerta a Internet; reinicio automático de contenedores.
5. Volumen Docker para datos en `uploads/` (eventos, invitados, planos, etc.).
6. Arranque típico (en la carpeta del dominio, con el compose de producción del servidor):

```bash
docker compose -f compose.production.yml up -d --build
```

7. Nginx: HTTPS → web (`3101`); `/api/docs` → API (`3100`); la web proxifica `/api/v1`. Timeout de proxy amplio (el cálculo puede tardar minutos).
8. Comprobar home, API, OpenAPI, HTTPS, DNS y contenedores.

> `compose.production.yml` y la config Nginx del host viven en el servidor de despliegue; en local se usa `npm run dev`.

Vista de bloques y runtime: [`docs/arquitectura/arquitectura-operativa-piloto.md`](docs/arquitectura/arquitectura-operativa-piloto.md).

## Documentación y trazabilidad

El **SDD** es la fuente de verdad funcional. El alcance **evaluable del piloto** está en `docs/pilot/`. Los agentes y desarrolladores deben empezar por:

1. [`AGENTS.md`](AGENTS.md) — instrucciones para agentes y estilo de trabajo
2. [`docs/README.md`](docs/README.md) — mapa de entrada a toda la documentación

| Documento | Para qué |
|-----------|----------|
| [`docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`](docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md) | Gobernanza SDD (no degradar requisitos) |
| [`docs/pilot/README.md`](docs/pilot/README.md) | Resumen del piloto evaluable |
| [`docs/pilot/ALCANCE-ACTUAL.md`](docs/pilot/ALCANCE-ACTUAL.md) | Capacidad real, limitaciones y evidencias |
| [`docs/pilot/TRAZABILIDAD.md`](docs/pilot/TRAZABILIDAD.md) | Requisitos ↔ código ↔ pruebas |
| [`docs/arquitectura/arquitectura-operativa-piloto.md`](docs/arquitectura/arquitectura-operativa-piloto.md) | Cómo corre el sistema hoy |
| [`docs/adr/`](docs/adr/) | Decisiones técnicas (ADR) |
| [`docs/agile/CONTEXTO-EJECUCION.md`](docs/agile/CONTEXTO-EJECUCION.md) | Retomar el trabajo (estado y siguiente acción) |
| [GitHub Project](https://github.com/users/quintasc/projects/2) | Planificación y estado de ejecución |

El inventario por carpetas y las rutas de lectura por rol están en [`docs/README.md`](docs/README.md).
