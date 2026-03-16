import type { NextApiRequest, NextApiResponse } from 'next';
import { callOpenRouter, safeParseJSON } from '../../../utils/openrouter';
import { getSessionFromRequest } from '../../../lib/supabaseServer';

export interface ParsedTask {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string; // YYYY-MM-DD
  project_name?: string;
}

export interface ParseTaskResponse {
  task: ParsedTask;
  confidence: 'high' | 'medium' | 'low';
  raw_input: string;
}

function buildSystemPrompt(today: string): string {
  return `You are a task parser. Today's date is ${today}.
Extract task details from natural language input and return a JSON object.

== DATE HANDLING ==
Today is ${today}. Use this to resolve ALL relative date references:
- "today" \u2192 ${today}
- "tomorrow" \u2192 next calendar day after ${today}
- "this Wednesday / Friday / Monday" \u2192 the nearest upcoming occurrence of that weekday from ${today}
- "next week" \u2192 Monday of the week after ${today}
- "end of week" \u2192 Friday of the current week from ${today}
If no date is mentioned, set due_date to null. NEVER put date text in the title or description.

Return this exact format:
{
  "task": {
    "title": "<concise action-oriented task title>",
    "description": "<optional extra details, omit if none>",
    "priority": "high | medium | low",
    "due_date": "YYYY-MM-DD or null",
    "project_name": "<project name if mentioned, else null>"
  },
  "confidence": "high | medium | low"
}

Rules:
- Title: concise, action-oriented, starts with a verb. Never includes date information.
- Priority: high if urgent/ASAP/important/today, medium if this week/soon, low if someday/eventually
- confidence: high if all fields clear, medium if some ambiguity, low if very vague`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth guard — reject unauthenticated direct API calls
  const user = await getSessionFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { input, today, projects } = req.body;
  if (!input?.trim()) return res.status(400).json({ error: 'input is required' });

  const projectList = (projects ?? []).map((p: any) => p.name).join(', ');
  const userMessage = `Today is ${today}.
${projectList ? `Available projects: ${projectList}` : ''}

Parse this into a task: "${input}"`;

  try {
    const raw = await callOpenRouter(buildSystemPrompt(today), userMessage, { temperature: 0.1, max_tokens: 256 });
    const parsed = safeParseJSON<ParseTaskResponse>(raw);
    return res.status(200).json({ ...parsed, raw_input: input });
  } catch (error: any) {
    console.error('ai-parse-task error:', error);
    return res.status(500).json({ error: error.message });
  }
}
