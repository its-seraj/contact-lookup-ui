export interface ScanRequest {
  domains: string[];
  isVerify: boolean;
  isLinkedin: boolean;
  /** Optional cost knobs (server defaults: 8 pages, 10 variants, 19 candidates). */
  maxPages?: number;
  sweepVariants?: number;
  permuteMax?: number;
  force?: boolean;
}

export interface ContactRow {
  domain: string;
  full_name: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  email_status: 'verified' | 'valid' | 'greylisted' | 'unverified' | 'name_only' | string;
  confidence: number;
  pattern: string;
  linkedin: string;
  linkedin_status: 'current' | 'mentioned' | 'unclear' | string;
  github: string;
  website: string;
  sources: string;
  notes: string;
}

export interface SourceMeta {
  name: string;
  ok: boolean;
  count: number;
  error?: string;
  skipped?: string;
}

export interface ScanCounts {
  people: number;
  with_email: number;
  verified: number;
  with_linkedin: number;
}

export interface ScanTimings {
  discovery?: number;
  linkedin_profiles?: number;
  linkedin_lookups?: number;
  verify?: number;
  permute?: number;
  [key: string]: number | undefined;
}

export interface ScanMeta {
  domain: string;
  generated_at?: string;
  elapsed_seconds?: number;
  total_records?: number;
  with_email?: number;
  with_name?: number;
  verified?: number;
  pattern?: string;
  patterns_considered?: string[];
  timings?: ScanTimings;
  mail?: {
    mx?: string[];
    providers?: string[];
    spf?: boolean;
  };
  sources?: SourceMeta[];
  github_nameless_logins?: string[];
  [key: string]: unknown;
}

export interface StartEvent {
  type: 'start';
  domain: string;
}

export interface LogEvent {
  type: 'log';
  domain: string;
  message: string;
}

/** Incremental rows: only new/changed entries, plus the keys to drop. */
export interface PartialEvent {
  type: 'partial';
  domain: string;
  stage: string;
  rows: ContactRow[];
  removed: string[];
  total: number;
  rows_total?: number;
}

export interface CachedEvent {
  type: 'cached';
  domain: string;
  flags?: { isVerify?: boolean; isLinkedin?: boolean };
  counts?: ScanCounts;
  meta?: ScanMeta;
  timings?: ScanTimings;
  scanned_at?: string;
}

export interface ResultEvent {
  type: 'result';
  domain: string;
  rows: ContactRow[];
  meta?: ScanMeta;
  counts?: ScanCounts;
  timings?: ScanTimings;
  scanned_at?: string;
  cached?: boolean;
}

export interface DoneEvent {
  type: 'done';
  domains: number;
  elapsed_ms: number;
}

export interface ErrorEvent {
  type: 'error';
  domain?: string;
  message: string;
}

export type ScanEvent =
  | StartEvent
  | LogEvent
  | PartialEvent
  | CachedEvent
  | ResultEvent
  | DoneEvent
  | ErrorEvent;

export interface LogMessage {
  id: string;
  domain: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'skipped' | 'progress' | 'detail';
}

export type ScanStatus = 'idle' | 'scanning' | 'completed' | 'error' | 'aborted';

