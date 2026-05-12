import crypto from "crypto";

export type JobStatus = "pending" | "running" | "done" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  uid: string;
  createdAt: number;
  updatedAt: number;
  result?: unknown;
  error?: string;
}

// In-memory store — resets on restart. Swap for Redis/Firestore for persistence.
const jobs = new Map<string, Job>();
const JOB_TTL_MS = 30 * 60 * 1000; // 30 minutes

function prune(): void {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) jobs.delete(id);
  }
}

export const jobStore = {
  create(uid: string): Job {
    prune();
    const id = crypto.randomUUID();
    const job: Job = { id, status: "pending", uid, createdAt: Date.now(), updatedAt: Date.now() };
    jobs.set(id, job);
    return job;
  },
  get(id: string): Job | undefined {
    return jobs.get(id);
  },
  setRunning(id: string): void {
    const j = jobs.get(id);
    if (j) { j.status = "running"; j.updatedAt = Date.now(); }
  },
  setDone(id: string, result: unknown): void {
    const j = jobs.get(id);
    if (j) { j.status = "done"; j.result = result; j.updatedAt = Date.now(); }
  },
  setFailed(id: string, error: string): void {
    const j = jobs.get(id);
    if (j) { j.status = "failed"; j.error = error; j.updatedAt = Date.now(); }
  }
};
