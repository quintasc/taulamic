import {
  type DistributionEngine,
  type DistributionEngineInput,
  type DistributionEngineResult,
} from './distribution-engine.port';
import { MOTOR_VERSION_V0_PILOT } from './distribution.types';
import { runMotorV0 } from './motor-v0.engine';

/** Adaptador Strategy del motor v0 greedy del piloto (fallback del ADR-023). */
export class MotorV0Engine implements DistributionEngine {
  readonly motorVersion = MOTOR_VERSION_V0_PILOT;

  compute(input: DistributionEngineInput): Promise<DistributionEngineResult> {
    return Promise.resolve(runMotorV0(input));
  }
}
