import type { AnalysisResult } from '../types';
import { apiFetch } from './api';

export { ANALYTICAL_SYSTEM_PROMPT } from '../../shared/analyticalSystemPrompt';

type InlineImagePart = { mimeType: string; data: string };

async function readApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: { message?: string }; message?: string };
    if (data.error?.message) return data.error.message;
    if (data.message) return data.message;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

const POLL_INTERVAL_MS = 2_000;
const POLL_MAX_ATTEMPTS = 90; // 3 minutes max

async function pollJob(jobId: string): Promise<AnalysisResult> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const res = await apiFetch(`/v1/gemini/jobs/${jobId}`);
    if (!res.ok) {
      throw new Error(await readApiError(res));
    }
    const data = (await res.json()) as {
      status: 'pending' | 'running' | 'done' | 'failed';
      result?: AnalysisResult;
      error?: string;
    };
    if (data.status === 'done' && data.result) return data.result;
    if (data.status === 'failed') throw new Error(data.error ?? 'Analysis failed.');
    // pending/running: keep polling
  }
  throw new Error('Analysis timed out. Please try again.');
}

export async function performComprehensiveAnalysis(
  assignmentData: string,
  rubricData: string,
  feedbackData: string,
  options?: { inlineImages?: InlineImagePart[] },
): Promise<AnalysisResult> {
  try {
    const res = await apiFetch('/v1/gemini/analyze', {
      method: 'POST',
      body: JSON.stringify({
        assignmentData,
        rubricData,
        feedbackData,
        inlineImages: options?.inlineImages ?? [],
      }),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res));
    }

    // Check if server returned a job (202) or direct result (200 cache hit)
    if (res.status === 202) {
      const { jobId } = (await res.json()) as { jobId: string };
      return await pollJob(jobId);
    }

    // Direct result (cache hit)
    return res.json() as Promise<AnalysisResult>;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    const hint = error instanceof Error && error.message ? ` (${error.message})` : '';
    throw new Error(`Analysis failed.${hint} Try clearer photos, or paste text from the rubric and feedback.`);
  }
}

export async function chatWithAdvocate(
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
) {
  try {
    const res = await apiFetch('/v1/gemini/advocate', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) {
      throw new Error(await readApiError(res));
    }
    const data = (await res.json()) as { text?: string };
    if (!data.text) throw new Error('Empty response from assistant.');
    return data.text;
  } catch (error) {
    console.error('Advocate API Error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to reach the appeal assistant. Try again in a moment.',
    );
  }
}
