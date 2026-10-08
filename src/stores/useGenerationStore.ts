import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GenerationJob, GenerationRequest } from '../services/contracts';
import {
  demoGeneration,
  restoreDemoGenerationJobs,
  transitionDemoGenerationJob,
} from '../services/demo/demoGeneration';

export type DemoScenario = 'success' | 'fail-first-attempt';

export type StoredGenerationJob = GenerationJob & {
  draftId: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  failFirstAttempt: boolean;
};

type GenerationState = {
  jobs: StoredGenerationJob[];
  activeJobId: string | null;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  beginDemoJob: (
    request: GenerationRequest,
    draftId: string,
    scenario: DemoScenario,
  ) => Promise<StoredGenerationJob>;
  retryDemoJob: (jobId: string) => void;
  setJobState: (jobId: string, state: GenerationJob['state'], errorCode?: GenerationJob['errorCode']) => void;
  setActiveJob: (jobId: string) => void;
};

const transitionTimers = new Map<string, ReturnType<typeof setTimeout>>();
const queueDelayMs = 900;
const processingDemoDelayMs = 2_200;

function scheduleDemoProgress(jobId: string) {
  if (transitionTimers.has(jobId)) return;
  const job = useGenerationStore.getState().jobs.find((item) => item.id === jobId);
  if (!job || (job.state !== 'queued' && job.state !== 'processing')) return;

  const delay = job.state === 'queued' ? queueDelayMs : processingDemoDelayMs;
  const timer = setTimeout(() => {
    transitionTimers.delete(jobId);
    const current = useGenerationStore.getState().jobs.find((item) => item.id === jobId);
    if (!current) return;
    if (current.state === 'queued') {
      useGenerationStore.getState().setJobState(jobId, 'processing');
      scheduleDemoProgress(jobId);
      return;
    }
    if (current.state === 'processing') {
      if (current.failFirstAttempt && current.attemptCount === 1) {
        useGenerationStore.getState().setJobState(jobId, 'failed', 'PROVIDER_FAILED');
      } else {
        useGenerationStore.getState().setJobState(jobId, 'completed');
      }
    }
  }, delay);
  transitionTimers.set(jobId, timer);
}

function resumePendingJobs() {
  const { jobs } = useGenerationStore.getState();
  restoreDemoGenerationJobs(jobs);
  for (const job of jobs) scheduleDemoProgress(job.id);
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      jobs: [],
      activeJobId: null,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      beginDemoJob: async (request, draftId, scenario) => {
        const idempotencyKey = request.idempotencyKey;
        const existing = get().jobs.find((job) => job.idempotencyKey === idempotencyKey);
        if (existing) {
          set({ activeJobId: existing.id });
          scheduleDemoProgress(existing.id);
          return existing;
        }

        const baseJob = await demoGeneration.createJob(request);
        const existingAfterCreate = get().jobs.find((job) => job.idempotencyKey === idempotencyKey);
        if (existingAfterCreate) {
          set({ activeJobId: existingAfterCreate.id });
          scheduleDemoProgress(existingAfterCreate.id);
          return existingAfterCreate;
        }
        const now = new Date().toISOString();
        const job: StoredGenerationJob = {
          ...baseJob,
          draftId,
          idempotencyKey,
          createdAt: now,
          updatedAt: now,
          attemptCount: 1,
          failFirstAttempt: scenario === 'fail-first-attempt',
        };
        set((state) => ({ jobs: [job, ...state.jobs], activeJobId: job.id }));
        scheduleDemoProgress(job.id);
        return job;
      },
      retryDemoJob: (jobId) => {
        const current = get().jobs.find((job) => job.id === jobId);
        if (!current || current.state !== 'failed') return;
        const retried: StoredGenerationJob = {
          ...current,
          ...transitionDemoGenerationJob(current, 'queued'),
          updatedAt: new Date().toISOString(),
          attemptCount: current.attemptCount + 1,
        };
        set((state) => ({
          jobs: state.jobs.map((job) => job.id === jobId ? retried : job),
          activeJobId: jobId,
        }));
        scheduleDemoProgress(jobId);
      },
      setJobState: (jobId, state, errorCode) => {
        const current = get().jobs.find((job) => job.id === jobId);
        if (!current) return;
        const transitioned: StoredGenerationJob = {
          ...current,
          ...transitionDemoGenerationJob(current, state, errorCode),
          updatedAt: new Date().toISOString(),
        };
        set((store) => ({
          jobs: store.jobs.map((job) => job.id === jobId ? transitioned : job),
        }));
      },
      setActiveJob: (activeJobId) => set({ activeJobId }),
    }),
    {
      name: 'ai-room-makeover.jobs.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ jobs, activeJobId }) => ({ jobs, activeJobId }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        setTimeout(resumePendingJobs, 0);
      },
    },
  ),
);
