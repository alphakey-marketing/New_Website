import type { NextApiRequest, NextApiResponse } from 'next';

export interface ParsedTask {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string; // YYYY-MM-DD
  project_name?: string; // matched against existing projects
}

export interface ParseTaskResponse {
  task: ParsedTask;
  confidence: 'high' | 'medium' | 'low';
  raw_input: string;
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
      temperature: 0.1,
      max_tokens: 512,
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

const SYSTEM_PROMPT = `You are a task parser. Extract task details from natural language input and return a JSON object.

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
- Title should be concise and action-oriented (start with a verb)
- Priority: high if urgent/ASAP/important/today, medium if this week/soon, low if someday/eventually
- due_date: resolve relative dates (today, tomorrow, Friday, next week) to ISO YYYY-MM-DD based on today's date provided
- If no due date mentioned, set due_date to null
- project_name: only set if a project is clearly mentioned (e.g. "for the marketing project")
- confidence: high if all fields clear, medium if some ambiguity, low if very vague`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { input, today, projects } = req.body;
  if (!input?.trim()) return res.status(400).json({ error: 'input is required' });

  const projectList = (projects ?? []).map((p: any) => p.name).join(', ');
  const userMessage = `Today is ${today}.
${projectList ? `Available projects: ${projectList}` : ''}

Parse this into a task: "${input}"`;

  try {
    const raw = await callOpenRouter(SYSTEM_PROMPT, userMessage);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json({ ...parsed, raw_input: input });
  } catch (error: any) {
    console.error('ai-parse-task error:', error);
    return res.status(500).json({ error: error.message });
  }
}
