export const GUEST_TEMPLATE_SHEET_NAME = 'invitados';
export const GUEST_TEMPLATE_INSTRUCTIONS_SHEET_NAME = 'instrucciones';

export const GUEST_TEMPLATE_REQUIRED_COLUMNS = [
  'nombre',
  'correo',
  'telefono',
] as const;

/** Columnas de la plantilla descargable (MEJ-02). */
export const GUEST_TEMPLATE_OPTIONAL_COLUMNS = [
  'direccion',
  'categoria_1',
  'categoria_2',
  'menu_especial',
  'movilidad_reducida',
  'notas_internas',
  'acompanante_key',
  'separar_acompanante',
] as const;

/** Solo importacion legacy; no se exporta en plantilla nueva. */
export const GUEST_TEMPLATE_LEGACY_OPTIONAL_COLUMNS = [
  'observaciones',
  'preferencia_control',
] as const;

/** Encabezados minimos de archivos legacy (sin columnas MEJ-02). */
export const GUEST_TEMPLATE_LEGACY_IMPORT_HEADERS = [
  ...GUEST_TEMPLATE_REQUIRED_COLUMNS,
  'direccion',
  'categoria_1',
  'categoria_2',
  'observaciones',
  'acompanante_key',
  'separar_acompanante',
] as const;

export const GUEST_TEMPLATE_DOWNLOAD_COLUMNS = [
  ...GUEST_TEMPLATE_REQUIRED_COLUMNS,
  ...GUEST_TEMPLATE_OPTIONAL_COLUMNS,
] as const;

export const GUEST_TEMPLATE_COLUMNS = [
  ...GUEST_TEMPLATE_DOWNLOAD_COLUMNS,
  ...GUEST_TEMPLATE_LEGACY_OPTIONAL_COLUMNS,
] as const;

export type GuestTemplateDownloadColumn =
  (typeof GUEST_TEMPLATE_DOWNLOAD_COLUMNS)[number];

export type GuestTemplateColumn = (typeof GUEST_TEMPLATE_COLUMNS)[number];

export const GUEST_TEMPLATE_FILENAME = 'taulamic-invitados-v1.xlsx';

export const GUEST_TEMPLATE_EXAMPLE_ROWS: ReadonlyArray<
  Record<GuestTemplateDownloadColumn, string>
> = [
  {
    nombre: 'Ana Garcia Lopez',
    correo: 'ana.garcia@ejemplo.com',
    telefono: '+34600111222',
    direccion: 'Calle Mayor 1, Madrid',
    categoria_1: 'Familia novia',
    categoria_2: '',
    menu_especial: 'X',
    movilidad_reducida: '',
    notas_internas: 'Intolerancia lactosa',
    acompanante_key: 'PAREJA_001',
    separar_acompanante: '',
  },
  {
    nombre: 'Luis Martinez Ruiz',
    correo: 'luis.martinez@ejemplo.com',
    telefono: '+34600333444',
    direccion: '',
    categoria_1: 'Familia novia',
    categoria_2: 'Pareja',
    menu_especial: '',
    movilidad_reducida: 'X',
    notas_internas: '',
    acompanante_key: 'PAREJA_001',
    separar_acompanante: '',
  },
];

export const GUEST_TEMPLATE_INSTRUCTIONS = [
  'Plantilla oficial Taulamic v1 para precarga de invitados.',
  '1. Rellena la hoja "invitados" sin cambiar los nombres de columna de la fila 1.',
  '2. Campos obligatorios: nombre, correo, telefono.',
  '3. Elimina las filas de ejemplo antes de subir el archivo.',
  '4. menu_especial / movilidad_reducida: deja vacio (no) o escribe X / Si para marcar alerta en Invitados.',
  '5. notas_internas: texto libre visible solo para el organizador.',
  '6. acompanante_key: mismo valor para personas que vienen juntas.',
  '7. separar_acompanante: deja vacio (no separar) o X / Si solo si hay excepcion.',
  '8. El modo colaborativo / anfitrion exclusivo se configura en la pantalla Preferencias del evento (no en Excel).',
  '9. Guarda el archivo en formato .xlsx y subelo desde la pantalla de importacion.',
] as const;
