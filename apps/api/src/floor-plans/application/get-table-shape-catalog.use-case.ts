import { Injectable } from '@nestjs/common';
import { listTableShapeCatalog } from '../domain/table-shape-catalog';

@Injectable()
export class GetTableShapeCatalogUseCase {
  execute(eventId: string) {
    return {
      eventId,
      shapes: listTableShapeCatalog(),
    };
  }
}
