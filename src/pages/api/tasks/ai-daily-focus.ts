import type { NextApiRequest, NextApiResponse } from 'next';
import { callOpenRouter, safeParseJSON } from '../../../utils/openrouter';
import { getSessionFromRequest } from '../../../lib/supabaseServer';
import type { TaskSnapshot } from './ai-suggest';

export interface FocusTask {
  taskId: string;
  taskTitle: string;
  rank: number;
  reason: string;
  estimatedMinutes: number;
}

export interface StaleTask {
  taskId: string;
  taskTitle: string;
  daysStale: number;
  suggestion: 'drop' | 'reschedule' | 'reprioritize';
  reason: string;
}

export interface DailyFocusResponse {
  topTasks: FocusTask[];
  staleTasks: StaleTask[];
  totalEstimatedMinutes: number;
  overloadWarning: string | null;
  motivationalNote: string;
}

function buildSystemPrompt(today: string): string {
  return `You are a personal productivity coach. Today's date is ${today}.
Analyse the user's tasks and return a JSON daily focus plan.

== DATE CONTEXT ==
Today is ${today}. Use this to determine:
- Which tasks are overdue (due_date < ${today})
- Which tasks are due today (due_date = ${today})
- Which tasks are stale (in todo/in_progress for 14+ days with no due date, OR overdue by 7+ days)

Return this exact format:
{
  "topTasks": [
    {
      "taskId": "<id>",
      "taskTitle": "<title>",
      "rank": 1,
      "reason": "<1 sentence why this is top priority today>",
      "estimatedMinutes": <number>
    }
  ],
  "staleTasks": [
    {
      "taskId": "<id>",
      "taskTitle": "<title>",
      "daysStale": <number>,
      "suggestion": "drop | reschedule | reprioritize",
      "reason": "<1 sentence>"
    }
  ],
  "totalEstimatedMinutes": <sum of top tasks minutes>,
  "overloadWarning": "<string if overloaded, else null>",
  "motivationalNote": "<short encouraging 1-liner>"
}

Rules for topTasks:
- Pick the 3 most important tasks for TODAY only
- Rank 1 = must do first, rank 3 = do last
- Consider: overdue > high priority due today > high priority due soon > medium priority
- estimatedMinutes: realistic guess (simple=15, medium=30, complex=60-120)
- Maximum 3 tasks in topTasks

Rules for staleTasks:
- Stale = todo/in_progress for 14+ days with no due date, OR overdue by 7+ days from ${today}
- Maximum 5 stale tasks
- suggestion: drop = no longer relevant; reschedule = set new deadline; reprioritize = change priority

overloadWarning: if totalEstimatedMinutes > 360 (6 hours), warn with a friendly message.
motivationalNote: short, warm, specific to their situation.`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getSessionFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { tasks }: { tasks: TaskSnapshot[] } = req.body;
  if (!tasks?.length) return res.status(400).json({ error: 'tasks array is required' });

  // Always derive today server-side — never trust client-supplied date
  const today = new Date().toISOString().split('T')[0];

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const cappedTasks = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    })
    .slice(0, 30);

  const taskSummary = cappedTasks.map((t) =>
    [
      `ID: ${t.id}`,
      `Title: ${t.title}`,
      `Status: ${t.status}`,
      `Priority: ${t.priority}`,
      t.due_date ? `Due: ${t.due_date}` : 'Due: not set',
      // Only include description when it adds meaningful context (>20 chars)
      t.description && t.description.length > 20 ? `Desc: ${t.description.slice(0, 80)}` : '',
    ].filter(Boolean).join(' | ')
  ).join('\n');

  const userMessage = `Today is ${today}.

My pending tasks:
${taskSummary}

Give me my top 3 focus tasks for today, identify any stale tasks, and provide a motivational note.`;

  try {
    const raw = await callOpenRouter(buildSystemPrompt(today), userMessage, { temperature: 0.3, max_tokens: 1500 });
    const parsed = safeParseJSON<DailyFocusResponse>(raw);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('ai-daily-focus error:', error);
    return res.status(500).json({ error: error.message });
  }
}
