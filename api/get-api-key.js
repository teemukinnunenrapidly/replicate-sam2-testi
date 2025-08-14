export default function handler(req, res) {
    // Validate request method
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['GET']
        });
    }

    try {
        // Get API key from environment
        const apiKey = process.env.REPLICATE_API_TOKEN;
        
        if (!apiKey) {
            console.error('REPLICATE_API_TOKEN not configured');
            return res.status(500).json({ 
                error: 'API key not configured',
                message: 'Please configure REPLICATE_API_TOKEN in Vercel environment variables'
            });
        }

        // Return API key with metadata
        res.status(200).json({ 
            success: true,
            apiKey: apiKey,
            message: 'API key retrieved successfully',
            keyLength: apiKey.length,
            keyPrefix: apiKey.substring(0, 3)
        });
        
    } catch (error) {
        console.error('Get API key handler error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve API key',
            details: error.message
        });
    }
}
