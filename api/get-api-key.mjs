export default function handler(req, res) {
    // Tarkista että on GET request
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Hae API key environment variablesta
    const apiKey = process.env.REPLICATE_API_TOKEN;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    // Palauta API key
    res.status(200).json({ 
        apiKey: apiKey,
        message: 'API key retrieved successfully'
    });
}
