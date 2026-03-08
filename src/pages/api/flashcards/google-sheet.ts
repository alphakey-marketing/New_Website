import type { NextApiRequest, NextApiResponse } from 'next';

interface FlashcardItem {
    kanji: string;
    hiragana: string;
    meaning: string;
}

const SHEET_ID = '1810Pq912u9YaGsr4o-BNaZWbdgOfHQAd1hiss8N8Rqc';
const RANGE = 'Sheet1!A:C'; // Columns: Kanji, Hiragana, Meaning

async function getAccessToken() {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
        ? 'repl ' + process.env.REPL_IDENTITY
        : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    if (!xReplitToken) {
        throw new Error('Authentication token not found');
    }

    const response = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
        {
            headers: {
                Accept: 'application/json',
                X_REPLIT_TOKEN: xReplitToken,
            },
        }
    );

    const data = await response.json();
    const connectionSettings = data.items?.[0];

    if (!connectionSettings) {
        throw new Error('Google Sheets connection not found');
    }

    const accessToken =
        connectionSettings.settings?.access_token ||
        connectionSettings.settings?.oauth?.credentials?.access_token;

    if (!accessToken) {
        throw new Error('Access token not found');
    }

    return accessToken;
}

async function fetchGoogleSheetData(): Promise<FlashcardItem[]> {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    // Skip header row (first row) and convert to FlashcardItem format
    const flashcards: FlashcardItem[] = rows
        .slice(1)
        .filter((row: string[]) => row.length >= 3 && row[0] && row[1] && row[2])
        .map((row: string[]) => ({
            kanji: row[0].trim(),
            hiragana: row[1].trim(),
            meaning: row[2].trim(),
        }));

    return flashcards;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FlashcardItem[] | { error: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const flashcards = await fetchGoogleSheetData();
        res.status(200).json(flashcards);
    } catch (error) {
        console.error('Error fetching Google Sheet:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to fetch flashcards',
        });
    }
}
