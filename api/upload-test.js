module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }
        
        // Testaa Replicate API:a yksinkertaisella kutsulla
        const response = await fetch('https://api.replicate.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Replicate API test error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            return res.status(response.status).json({
                error: `Replicate API test failed: ${response.statusText}`,
                details: errorText
            });
        }
        
        const models = await response.json();
        
        // Palauta onnistunut vastaus
        res.status(200).json({
            success: true,
            message: 'Replicate API test successful',
            modelsCount: models.results ? models.results.length : 'Unknown',
            apiStatus: 'Working'
        });
        
    } catch (error) {
        console.error('Upload test handler error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to test Replicate API',
            details: error.message
        });
    }
}



