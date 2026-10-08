import type { GenerationJob } from './contracts';

export function getGenerationErrorMessage(code: GenerationJob['errorCode']): string {
  switch (code) {
    case 'INVALID_IMAGE':
      return 'This photo could not be used. Choose a clear room photo that meets the image requirements.';
    case 'TRIAL_USED':
      return 'The free demo trial is no longer available for this guest session.';
    case 'INSUFFICIENT_CREDITS':
      return 'There are not enough credits for this makeover. Review the available plans.';
    case 'FORBIDDEN':
      return 'This makeover is not available to the current account. Sign in with the account that owns it.';
    case 'PROVIDER_FAILED':
      return 'The demo provider simulated a temporary failure. Retry this same job to continue.';
    case 'JOB_TIMEOUT':
      return 'This job took too long and was closed. You can safely retry the existing job.';
    default:
      return 'The makeover could not be completed. Retry the job or return home.';
  }
}
