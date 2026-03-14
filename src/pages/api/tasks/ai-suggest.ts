import type { NextApiRequest, NextApiResponse } from 'next';

export interface TaskSnapshot {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_name?: string;
}

export interface AISuggestion {
  id: string;
  taskId: string;
  taskTitle: string;
  type: 'reprioritize' | 'reschedule' | 'rewrite' | 'sequence' | 'split' | 'general';
  explanation: string;
  currentValue: string;
  proposedValue: string;
  field?: 'priority' | 'due_date' | 'description' | 'title';
  subTasks?: { title: string; description?: string }[];
  orderedTaskIds?: string[]; // for sequence type — ordered list of task IDs
}

interface RequestBody {
  tasks: TaskSnapshot[];
  projects: { id: string; name: string }[];
  userPrompt: string;
}

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in environment variables.');

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
      temperature: 0.2,
      max_tokens: 2048,
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
  return data.choices?.[0]?.message?.content ?? '';
}

const SYSTEM_PROMPT = `You are a productivity assistant. You must respond with a JSON object containing a "suggestions" array.

Analyse the user's tasks and return actionable suggestions in this exact format:
{
  "suggestions": [
    {
      "id": "s1",
      "taskId": "<task id>",
      "taskTitle": "<task title>",
      "type": "reprioritize",
      "explanation": "<1-2 sentences why, friendly tone>",
      "currentValue": "<current value>",
      "proposedValue": "<proposed value>",
      "field": "priority"
    }
  ]
}

Field rules:
- type: one of reprioritize | reschedule | rewrite | sequence | split | general
- field: one of priority | due_date | description | title (omit for sequence, split, or general types)
- priority values: high | medium | low
- due_date values: ISO format YYYY-MM-DD
- Maximum 8 suggestions total
- Be specific, actionable, and encouraging
- You only have access to task data. Never mention notes or documents.

---
REPRIORITIZE rules (STRICT — only suggest when there is a concrete, data-backed reason):
- ONLY suggest reprioritize if ONE of these specific conditions is true:
  a) Task is overdue (past due date) but set to low or medium priority
  b) Task has a due date within the next 3 days but is set to low priority
  c) Task has no due date and has been in todo for a long time AND is set to high priority with no justification
  d) Two tasks clearly conflict in priority (e.g. a blocker is lower priority than the task it blocks)
- DO NOT suggest reprioritize just because you think a task "sounds important" or "seems urgent"
- DO NOT suggest reprioritize for tasks already at an appropriate priority level
- If no task meets the strict conditions above, return zero reprioritize suggestions
---

For type "sequence":
- Use type "sequence" ONLY for a single holistic suggestion covering the best order for ALL tasks
- Set taskId to "" (empty string) and taskTitle to "Recommended task order"
- Set proposedValue to a numbered list like "1. Task A\n2. Task B\n3. Task C"
- Set currentValue to ""
- Include orderedTaskIds: an array of task IDs in the recommended order
- sequence suggestions are READ-ONLY — the user sees the order but there is no database change
- Return at most 1 sequence suggestion

For type "split" specifically:
- Set proposedValue to a short human-readable summary e.g. "3 sub-tasks"
- Set currentValue to the original task title
- Include a "subTasks" array with each sub-task as { "title": "...", "description": "..." }
- Do NOT put sub-task titles inside proposedValue as a plain string

For type "general":
- Use for advice that doesn't map to a specific field change
- Set taskId to "", taskTitle to "", currentValue to "", proposedValue to the advice text
- These are READ-ONLY — show as informational, no Accept button`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tasks, projects, userPrompt }: RequestBody = req.body;

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'tasks array is required' });
  }

  const taskSummary = tasks
    .map((t) =>
      [
        `ID: ${t.id}`,
        `Title: ${t.title}`,
        `Status: ${t.status}`,
        `Priority: ${t.priority}`,
        t.due_date ? `Due: ${t.due_date}` : 'Due: not set',
        t.description ? `Description: ${t.description}` : '',
        t.project_name ? `Project: ${t.project_name}` : 'Project: none',
      ]
        .filter(Boolean)
        .join(' | ')
    )
    .join('\n');

  const today = new Date().toISOString().split('T')[0];
  const userMessage = `Today is ${today}.\n\nHere are my tasks:\n${taskSummary}\n\nRequest: ${
    userPrompt || 'Analyse my tasks and suggest how to best prioritise and sequence them.'
  }\n\nRespond with a JSON object containing a "suggestions" array.`;

  try {
    const raw = await callOpenRouter(SYSTEM_PROMPT, userMessage);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let suggestions: AISuggestion[];
    try {
      const parsed = JSON.parse(cleaned);
      suggestions = Array.isArray(parsed) ? parsed : (parsed.suggestions ?? []);
    } catch {
      const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try { suggestions = JSON.parse(match[0]); }
        catch { suggestions = [{ id: 's_error', taskId: '', taskTitle: '', type: 'general', explanation: 'I had trouble formatting my response. Please try again.', currentValue: '', proposedValue: raw.slice(0, 300) }]; }
      } else {
        suggestions = [{ id: 's_error', taskId: '', taskTitle: '', type: 'general', explanation: 'I had trouble formatting my response. Please try again.', currentValue: '', proposedValue: raw.slice(0, 300) }];
      }
    }

    return res.status(200).json({ suggestions });
  } catch (error: any) {
    console.error('AI suggest error:', error);
    return res.status(500).json({ error: error.message });
  }
}
