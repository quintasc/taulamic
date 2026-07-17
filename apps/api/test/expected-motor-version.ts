import {
  MOTOR_VERSION_V0_PILOT,
  MOTOR_VERSION_V1_CPSAT,
  type MotorVersion,
} from '../src/distribution/domain/distribution.types';

/** Misma resolución que `distribution.module` + `app.config`. */
export function configuredDistributionEngine(): string {
  return process.env.DISTRIBUTION_ENGINE ?? 'v1';
}

export function expectedMotorVersion(): MotorVersion {
  const engine = configuredDistributionEngine();
  const useCpSat = engine === 'v1' || engine === 'cpsat';
  return useCpSat ? MOTOR_VERSION_V1_CPSAT : MOTOR_VERSION_V0_PILOT;
}
