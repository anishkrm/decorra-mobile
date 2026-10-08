import type {
  GenerationJob,
  GenerationRequest,
  GenerationService,
  GenerationState,
} from '../contracts';

const demoJobs = new Map<string, GenerationJob>();

/**
 * Local-only job adapter. It never uploads a photo or calls an image provider.
 * The Zustand job store persists its state; this adapter is rehydrated from it
 * when the app restarts.
 */
export const demoGeneration: GenerationService = {
  async createJob(request: GenerationRequest): Promise<GenerationJob> {
    const id = `demo-${request.idempotencyKey}`;
    const existing = demoJobs.get(id);
    if (existing) return existing;

    const job: GenerationJob = {
      id,
      state: 'queued',
      sourceUri: request.sourceUri,
      demo: true,
    };
    demoJobs.set(id, job);
    return job;
  },

  async getJob(jobId: string): Promise<GenerationJob> {
    const job = demoJobs.get(jobId);
    if (!job) throw new Error('DEMO_JOB_NOT_FOUND');
    return job;
  },
};

export function updateDemoGenerationJob(job: GenerationJob) {
  demoJobs.set(job.id, job);
}

export function restoreDemoGenerationJobs(jobs: GenerationJob[]) {
  for (const job of jobs) demoJobs.set(job.id, job);
}

export function transitionDemoGenerationJob(
  job: GenerationJob,
  state: GenerationState,
  errorCode?: GenerationJob['errorCode'],
): GenerationJob {
  const next: GenerationJob = {
    ...job,
    state,
    errorCode: state === 'failed' ? errorCode : undefined,
    resultUri: state === 'completed' ? undefined : job.resultUri,
    demo: true,
  };
  updateDemoGenerationJob(next);
  return next;
}
