import type { NextApiRequest, NextApiResponse } from 'next';
import type { TaskSnapshot } from './ai-suggest';

export interface FocusTask {
  taskId: string;
  taskTitle: string;
  rank: number; // 1 = most important
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
  overloadWarning: string | null; // null if day is manageable
  motivationalNote: string;
}

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set.');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://alphakey-marketing.replit.app',
      'X-Title': 'AlphaKey Task Assistant',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-small-3.1-24b-instruct',
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '{}';
}

const SYSTEM_PROMPT = `You are a personal productivity coach. Analyse the user's tasks and return a JSON daily focus plan.

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
- estimatedMinutes: realistic guess (simple task=15, medium=30, complex=60-120)
- Maximum 3 tasks in topTasks

Rules for staleTasks:
- A task is stale if it has been in todo or in_progress status for 14+ days with no due date, OR is overdue by 7+ days
- Maximum 5 stale tasks
- suggestion: drop = task may no longer be relevant; reschedule = set a new realistic deadline; reprioritize = change priority level

overloadWarning: if totalEstimatedMinutes > 360 (6 hours), warn the user with a friendly message.
motivationalNote: short, warm, specific to their situation.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tasks, today }: { tasks: TaskSnapshot[]; today: string } = req.body;
  if (!tasks?.length) return res.status(400).json({ error: 'tasks array is required' });

  const pending = tasks.filter((t) => t.status !== 'done');
  const taskSummary = pending.map((t) =>
    [
      `ID: ${t.id}`,
      `Title: ${t.title}`,
      `Status: ${t.status}`,
      `Priority: ${t.priority}`,
      t.due_date ? `Due: ${t.due_date}` : 'Due: not set',
      t.description ? `Desc: ${t.description}` : '',
    ].filter(Boolean).join(' | ')
  ).join('\n');

  const userMessage = `Today is ${today}.

My pending tasks:
${taskSummary}

Give me my top 3 focus tasks for today, identify any stale tasks, and provide a motivational note.`;

  try {
    const raw = await callOpenRouter(SYSTEM_PROMPT, userMessage);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed: DailyFocusResponse = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('ai-daily-focus error:', error);
    return res.status(500).json({ error: error.message });
  }
}
