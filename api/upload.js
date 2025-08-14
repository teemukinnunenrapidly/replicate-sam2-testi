module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }
        
        const { imageData, fileName, contentType } = req.body;
        if (!imageData) {
            return res.status(400).json({ error: 'Image data required' });
        }
        
        // Simple test response for now
        res.status(200).json({
            success: true,
            message: 'Upload endpoint working!',
            receivedData: {
                fileName,
                contentType,
                dataLength: imageData.length
            }
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
