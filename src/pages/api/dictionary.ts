import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
    data?: any;
    error?: string;
};


// Function to extract pitch accent information
function extractPitchAccent(japaneseItem: any): string | null {
    // Jisho.org API doesn't directly provide pitch accent,
    // but we can add a note about common pitch patterns
    // For now, we'll try to fetch from Wanikani or similar if available
    // Otherwise return null and display a placeholder
    
    // Check if there's pitch information in the response
    if (japaneseItem.word) {
        // Common pitch accent patterns for reference
        // This is a basic implementation - could be enhanced with actual pitch data
        return null;
    }
    return null;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid keyword parameter' });
    }

    try {
        const response = await fetch(
            `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`
        );

        if (!response.ok) {
            throw new Error(`Jisho API returned status ${response.status}`);
        }

        const data = await response.json();
        console.log('Jisho API response for keyword:', keyword, 'Data:', JSON.stringify(data).substring(0, 500));
        
        // Enhance the data with pitch accent info
        if (data.data && Array.isArray(data.data)) {
            data.data = data.data.map((item: any) => {
                const enhanced = { ...item };
                
                // Try to get pitch accent from Jisho's API (if available)
                if (item.japanese && item.japanese[0]) {
                    // Check for pitch field in the response
                    const pitchAccent = item.japanese[0].word;
                    
                    // Add a pitch field (can be enhanced with actual pitch data later)
                    enhanced.pitchAccent = null; // Placeholder for now
                }
                
                return enhanced;
            });
        }
        
        // Return the enhanced data
        res.status(200).json(data);
    } catch (error) {
        console.error('Dictionary API error:', error);
        res.status(500).json({ error: 'Failed to fetch dictionary data' });
    }
}
