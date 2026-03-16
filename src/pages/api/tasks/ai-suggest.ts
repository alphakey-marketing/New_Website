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
  type: 'reprioritize' | 'reschedule' | 'rewrite' | 'sequence' | 'split' | 'scaffold' | 'general';
  explanation: string;
  currentValue: string;
  proposedValue: string;
  field?: 'priority' | 'due_date' | 'description' | 'title';
  subTasks?: { title: string; description?: string; priority?: string; due_date?: string | null }[];
  orderedTaskIds?: string[];
  // scaffold-specific
  scaffoldProjectName?: string;
  scaffoldProjectColor?: string;
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

== CRITICAL RULE: ONLY RESPOND TO WHAT THE USER ASKS ==
You must ONLY produce suggestion types that are directly relevant to the user's request.
- If the user asks to create a project or tasks → use "scaffold"
- If the user asks to break down a task → use "split"
- If the user asks for task order/sequence → use "sequence"
- If the user explicitly asks to fix priorities → use "reprioritize"
- If the user explicitly asks to fix deadlines/dates → use "reschedule"
- If the user asks to improve wording/descriptions → use "rewrite"
- DO NOT add reprioritize or reschedule suggestions unless the user's request explicitly asks for them
- DO NOT mix suggestion types — respond only to what was asked

== DATE HANDLING ==
Today's date is always provided in the user message as "Today is YYYY-MM-DD".
When a user mentions a due date for a task (e.g. "by Wednesday", "done by this Friday", "due next Monday", "by end of week"), you MUST:
- Resolve it to an absolute YYYY-MM-DD date based on today's date
- Set due_date on the relevant subTask to that resolved date
- NEVER put date information in the title or description — always use the due_date field
- If no date is mentioned for a task, set due_date to null

== RESPONSE FORMAT ==
{
  "suggestions": [
    {
      "id": "s1",
      "taskId": "<task id or empty string>",
      "taskTitle": "<task title>",
      "type": "<type>",
      "explanation": "<1-2 sentences, friendly tone>",
      "currentValue": "<current value or empty string>",
      "proposedValue": "<proposed value or empty string>",
      "field": "<priority|due_date|description|title — omit for scaffold/sequence/split/general>"
    }
  ]
}

== TYPE: scaffold ==
Use when the user wants to create a NEW PROJECT with tasks inside it.
- Set taskId to "" and taskTitle to the new project name
- Set scaffoldProjectName to the project name (e.g. "invesbot")
- Set scaffoldProjectColor to a sensible hex color (e.g. "#6366f1")
- Set proposedValue to a human summary e.g. "1 project + 3 tasks"
- Set currentValue to ""
- Include a subTasks array with each task: { title, description, priority, due_date }
  - priority: "high" | "medium" | "low"
  - due_date: resolved YYYY-MM-DD string if a date was mentioned, otherwise null
  - NEVER put date info in title or description — use due_date field only
- Example:
  {
    "id": "s1",
    "taskId": "",
    "taskTitle": "invesbot",
    "type": "scaffold",
    "explanation": "I will create the project \"invesbot\" and add your 3 tasks to it.",
    "currentValue": "",
    "proposedValue": "1 project + 3 tasks",
    "scaffoldProjectName": "invesbot",
    "scaffoldProjectColor": "#6366f1",
    "subTasks": [
      { "title": "Get the API", "description": "Obtain and set up the required API credentials", "priority": "high", "due_date": null },
      { "title": "Send AI idea to MarCom", "description": "", "priority": "high", "due_date": "2026-03-18" },
      { "title": "UAT", "description": "User acceptance testing", "priority": "medium", "due_date": null }
    ]
  }

== TYPE: split ==
- Set proposedValue to e.g. "3 sub-tasks"
- Set currentValue to the original task title
- Include subTasks array: { title, description, priority, due_date }
- Do NOT put sub-task titles inside proposedValue

== TYPE: sequence ==
- Use for ordering existing tasks only
- Set taskId to "", taskTitle to "Recommended task order"
- Set proposedValue to a numbered list
- Include orderedTaskIds: array of task IDs in recommended order
- READ-ONLY — no database change
- Return at most 1 sequence suggestion

== TYPE: reprioritize ==
ONLY if user explicitly asks. AND only if ONE of these conditions is met:
  a) Task is overdue but set to low/medium priority
  b) Task due within 3 days but set to low priority
  c) Two tasks conflict in priority (blocker is lower priority than blocked)
If no task meets these conditions, return zero reprioritize suggestions.

== TYPE: reschedule ==
ONLY if user explicitly asks to fix deadlines or reschedule.

== TYPE: general ==
- Set taskId, taskTitle, currentValue all to ""
- Set proposedValue to the advice text
- READ-ONLY — informational only, no Accept button`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tasks, projects, userPrompt }: RequestBody = req.body;

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'tasks array is required' });
  }

  const taskSummary = tasks.length > 0
    ? tasks.map((t) =>
        [
          `ID: ${t.id}`,
          `Title: ${t.title}`,
          `Status: ${t.status}`,
          `Priority: ${t.priority}`,
          t.due_date ? `Due: ${t.due_date}` : 'Due: not set',
          t.description ? `Description: ${t.description}` : '',
          t.project_name ? `Project: ${t.project_name}` : 'Project: none',
        ].filter(Boolean).join(' | ')
      ).join('\n')
    : '(no tasks yet)';

  const today = new Date().toISOString().split('T')[0];
  const userMessage = `Today is ${today}.\n\nExisting tasks:\n${taskSummary}\n\nUser request: ${userPrompt}\n\nRespond with a JSON object containing a "suggestions" array. Only respond to exactly what the user asked for.`;

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
