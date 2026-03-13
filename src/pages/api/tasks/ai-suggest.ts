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
- field: one of priority | due_date | description | title (omit for sequence or general types)
- priority values: high | medium | low
- due_date values: ISO format YYYY-MM-DD
- Maximum 8 suggestions total
- Be specific, actionable, and encouraging
- You only have access to task data. Never mention notes or documents.`;

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

    // Strip markdown fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let suggestions: AISuggestion[];
    try {
      const parsed = JSON.parse(cleaned);
      // Handle both { suggestions: [...] } and bare [...] responses
      suggestions = Array.isArray(parsed) ? parsed : (parsed.suggestions ?? []);
    } catch {
      // Last resort: try to extract a JSON array with regex
      const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try {
          suggestions = JSON.parse(match[0]);
        } catch {
          suggestions = [{
            id: 's_error',
            taskId: '',
            taskTitle: '',
            type: 'general',
            explanation: 'I had trouble formatting my response. Please try again.',
            currentValue: '',
            proposedValue: raw.slice(0, 300),
          }];
        }
      } else {
        suggestions = [{
          id: 's_error',
          taskId: '',
          taskTitle: '',
          type: 'general',
          explanation: 'I had trouble formatting my response. Please try again.',
          currentValue: '',
          proposedValue: raw.slice(0, 300),
        }];
      }
    }

    return res.status(200).json({ suggestions });
  } catch (error: any) {
    console.error('AI suggest error:', error);
    return res.status(500).json({ error: error.message });
  }
}
