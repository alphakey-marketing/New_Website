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
      model: 'mistralai/mistral-7b-instruct',
      temperature: 0.4,
      max_tokens: 2048,
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

const SYSTEM_PROMPT = `You are a personal productivity assistant. You ONLY have access to the user's tasks and projects data. You have NO access to notes, documents, passwords, or any other data.

Your job is to analyse the tasks provided and return a JSON array of actionable suggestions to help the user prioritise and organise their work.

Each suggestion must follow this exact JSON structure:
{
  "id": "<unique string like s1, s2, s3>",
  "taskId": "<the task id>",
  "taskTitle": "<the task title>",
  "type": "<one of: reprioritize | reschedule | rewrite | sequence | split | general>",
  "explanation": "<1-2 sentences explaining WHY you suggest this change, friendly tone>",
  "currentValue": "<what it currently is>",
  "proposedValue": "<what you recommend instead>",
  "field": "<one of: priority | due_date | description | title - omit for sequence/general>"
}

Rules:
- Return ONLY a valid JSON array. No markdown, no explanation outside the array.
- Maximum 8 suggestions per response.
- Be specific and actionable. Explain your reasoning briefly.
- For sequence suggestions, list the proposed order in proposedValue as "1. Task A -> 2. Task B -> 3. Task C".
- For reprioritize, use values: high | medium | low.
- For reschedule, use ISO date format YYYY-MM-DD in proposedValue.
- Be encouraging and gentle in tone - the user appreciates kind guidance.
- Never mention or ask about notes or documents.`;

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
  const userMessage = `Today is ${today}.\n\nHere are my tasks:\n${taskSummary}\n\nUser request: ${
    userPrompt || 'Please analyse my tasks and suggest how to best prioritise and sequence them.'
  }`;

  try {
    const raw = await callOpenRouter(SYSTEM_PROMPT, userMessage);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let suggestions: AISuggestion[];
    try {
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [
        {
          id: 's_error',
          taskId: '',
          taskTitle: '',
          type: 'general',
          explanation: 'I had trouble formatting my response. Please try again or rephrase your request.',
          currentValue: '',
          proposedValue: raw.slice(0, 300),
        },
      ];
    }

    return res.status(200).json({ suggestions });
  } catch (error: any) {
    console.error('AI suggest error:', error);
    return res.status(500).json({ error: error.message });
  }
}
