export type GeneratedGuestTemplate = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

export type GuestTemplateGeneratorPort = {
  generate(): Promise<GeneratedGuestTemplate>;
};

export const GUEST_TEMPLATE_GENERATOR = Symbol('GUEST_TEMPLATE_GENERATOR');
