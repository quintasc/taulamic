/**
 * Smoke test piloto contra API en marcha (localhost:3000).
 * Uso: node scripts/smoke-pilot-local.mjs [baseUrl]
 */
import ExcelJS from 'exceljs';

const base = process.argv[2] ?? 'http://localhost:3000';
const adminHeaders = { 'x-taulamic-actor-role': 'admin' };

const GUEST_COLUMNS = [
  'nombre',
  'correo',
  'telefono',
  'direccion',
  'categoria_1',
  'categoria_2',
  'observaciones',
  'acompanante_key',
  'separar_acompanante',
  'preferencia_control',
];
const SHEET = 'invitados';

async function buildWorkbook(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(SHEET);
  sheet.addRow([...GUEST_COLUMNS]);
  for (const row of rows) {
    sheet.addRow(row);
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function json(method, path, body, headers = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: response.status, data };
}

async function main() {
  const steps = [];
  const ok = (name, detail) => {
    steps.push({ name, ok: true, detail });
    console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`);
  };
  const fail = (name, detail) => {
    steps.push({ name, ok: false, detail });
    console.error(`✗ ${name} — ${detail}`);
    process.exitCode = 1;
  };

  console.log(`Smoke piloto → ${base}\n`);

  const created = await json('POST', '/api/v1/events', { name: 'Smoke test piloto' });
  if (created.status !== 201) {
    fail('Crear evento', `HTTP ${created.status}`);
    return;
  }
  const eventId = created.data.id;
  ok('Crear evento', eventId);

  for (const table of [
    { label: 'Mesa principal', shape: 'redonda', estimatedCapacity: 6 },
    { label: 'Mesa familiar', shape: 'rectangular', estimatedCapacity: 6 },
  ]) {
    const res = await json('POST', `/api/v1/events/${eventId}/tables`, table);
    if (res.status !== 201) {
      fail('Añadir mesa', `${table.label} → HTTP ${res.status}`);
      return;
    }
  }
  ok('Añadir 2 mesas');

  const event = await json('GET', `/api/v1/events/${eventId}`);
  if (event.data?.capacitySummary?.tableCount !== 2) {
    fail('Resumen mesas', JSON.stringify(event.data?.capacitySummary));
    return;
  }
  ok('Resumen mesas', '2 mesas, 12 plazas');

  const prefs = await json('GET', `/api/v1/events/${eventId}/preference-control-mode`);
  if (prefs.data?.mode !== 'colaborativo') {
    fail('Preferencias', JSON.stringify(prefs.data));
    return;
  }
  ok('Modo preferencias', 'colaborativo');

  const buffer = await buildWorkbook([
    ['Ana Garcia Lopez', 'ana@ejemplo.com', '+34600111222', '', 'Familia', '', '', 'PAREJA_001', 'false', 'colaborativo'],
    ['Luis Martinez', 'luis@ejemplo.com', '+34600333444', '', 'Familia', 'Pareja', '', 'PAREJA_001', 'false', 'colaborativo'],
    ['Maria Santos', 'maria@ejemplo.com', '+34600555666', '', 'Amigos', '', '', 'PAREJA_002', 'false', ''],
    ['Pedro Ruiz', 'pedro@ejemplo.com', '+34600777888', '', 'Amigos', '', '', 'PAREJA_002', 'false', ''],
  ]);

  const form = new FormData();
  form.append(
    'file',
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    'invitados-smoke.xlsx',
  );
  const importRes = await fetch(
    `${base}/api/v1/events/${eventId}/guest-import/import`,
    { method: 'POST', body: form },
  );
  const imported = await importRes.json();
  if (importRes.status !== 200 || imported.created !== 4) {
    fail('Import Excel', `HTTP ${importRes.status} ${JSON.stringify(imported)}`);
    return;
  }
  ok('Import Excel', '4 invitados');

  const guests = await json(
    'GET',
    `/api/v1/events/${eventId}/guests?actorRole=admin`,
  );
  if (guests.data?.total !== 4) {
    fail('Listar invitados', JSON.stringify(guests.data));
    return;
  }
  ok('Listar invitados', 'total=4');

  const run = await json(
    'POST',
    `/api/v1/events/${eventId}/distribution/run`,
    null,
    adminHeaders,
  );
  if (run.status !== 201 || run.data?.stats?.unassignedCount !== 0) {
    fail('Calcular distribución', `HTTP ${run.status} ${JSON.stringify(run.data?.stats)}`);
    return;
  }
  ok('Calcular distribución', `motor ${run.data.motorVersion}, 4 asignados`);

  const confirm = await json(
    'POST',
    `/api/v1/events/${eventId}/distribution/confirm`,
    null,
    adminHeaders,
  );
  if (confirm.status !== 200 || confirm.data?.status !== 'confirmed') {
    fail('Confirmar distribución', `HTTP ${confirm.status}`);
    return;
  }
  ok('Confirmar distribución');

  const approved = await json('GET', `/api/v1/events/${eventId}`);
  if (approved.data?.status !== 'plan_approved') {
    fail('Estado evento', approved.data?.status);
    return;
  }
  ok('Evento plan_approved');

  console.log(`\nFlujo piloto OK. eventId=${eventId}`);
  console.log(`UI: http://localhost:3001/admin/events/${eventId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
