export type RoomType =
  | 'living-room'
  | 'bedroom'
  | 'kitchen'
  | 'dining-room'
  | 'office'
  | 'bathroom';

export type InteriorStyle =
  | 'modern'
  | 'minimalist'
  | 'scandinavian'
  | 'industrial'
  | 'bohemian'
  | 'luxury';

export type GenerationState =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export type GenerationRequest = {
  sourceUri: string;
  roomType: RoomType;
  style: InteriorStyle;
  instructions?: string;
  idempotencyKey: string;
};

export type GenerationJob = {
  id: string;
  state: GenerationState;
  sourceUri: string;
  resultUri?: string;
  errorCode?:
    | 'INVALID_IMAGE'
    | 'TRIAL_USED'
    | 'INSUFFICIENT_CREDITS'
    | 'FORBIDDEN'
    | 'PROVIDER_FAILED'
    | 'JOB_TIMEOUT';
  demo: boolean;
};

export type Plan = {
  id: string;
  name: string;
  priceMinor: number;
  currency: string;
  billingPeriod: 'month' | 'year';
  credits: number;
  discountPercent: number;
};

export interface AuthService {
  getSession(): Promise<{ userId: string; isGuest: boolean } | null>;
  signOut(): Promise<void>;
}

export interface UploadService {
  authorizeUpload(file: { uri: string; contentType: string; sizeBytes: number }): Promise<string>;
}

export interface GenerationService {
  createJob(request: GenerationRequest): Promise<GenerationJob>;
  getJob(jobId: string): Promise<GenerationJob>;
}

export interface PlansService {
  listPlans(): Promise<Plan[]>;
  getCreditBalance(): Promise<number>;
}

export interface PurchasesService {
  purchase(planId: string): Promise<{ status: 'pending' | 'simulated' }>;
  restore(): Promise<{ restoredCount: number; simulated: boolean }>;
}

export interface SavedDesignsService {
  list(): Promise<GenerationJob[]>;
  save(jobId: string): Promise<void>;
  delete(jobId: string): Promise<void>;
}

export interface ExportService {
  authorizeDownload(jobId: string): Promise<string>;
}

export type ApplicationServices = {
  auth: AuthService;
  uploads: UploadService;
  generation: GenerationService;
  plans: PlansService;
  purchases: PurchasesService;
  savedDesigns: SavedDesignsService;
  exports: ExportService;
};
