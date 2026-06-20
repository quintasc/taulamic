import { Inject, Injectable } from '@nestjs/common';
import {
  GUEST_TEMPLATE_GENERATOR,
  type GeneratedGuestTemplate,
  type GuestTemplateGeneratorPort,
} from '../infrastructure/excel/guest-template.generator.port';

@Injectable()
export class GenerateGuestTemplateUseCase {
  constructor(
    @Inject(GUEST_TEMPLATE_GENERATOR)
    private readonly templateGenerator: GuestTemplateGeneratorPort,
  ) {}

  execute(_eventId: string): Promise<GeneratedGuestTemplate> {
    return this.templateGenerator.generate();
  }
}
