import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('admin').digest('hex');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
        const token = crypto.randomBytes(32).toString('hex');
        return res.status(200).json({ 
            success: true, 
            token,
            username: ADMIN_USERNAME 
        });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
}
