/**
 * Configuración de marca centralizada (piloto: valores fijos).
 * Post-MVP: sustituir assets por PNG/SVG en `public/brand/{themeId}/`
 * o cargar paquetes de tema — ver ADR-017 y docs/ux/frontend-component-system.md.
 */
export const brandConfig = {
  themeId: 'taulamic-default',
  productName: 'taulamic',
  productNameDisplay: 'Taulamic',
  assets: {
    logoPng: '/taulamic-logo.png',
    wordmarkPng: '/taulamic-wordmark.png',
    iconBodasPng: '/taulamic-icon-bodas.png',
  },
} as const;

export type BrandConfig = typeof brandConfig;
