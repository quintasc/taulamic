import { Injectable } from '@nestjs/common';
import { LayoutDraft } from '../domain/layout-draft';
import { LayoutDraftGuard } from './layout-draft.guard';

@Injectable()
export class GetLayoutDraftUseCase {
  constructor(private readonly guard: LayoutDraftGuard) {}

  execute(eventId: string, floorPlanId: string): Promise<LayoutDraft> {
    return this.guard.loadOrInitDraft(eventId, floorPlanId);
  }
}
