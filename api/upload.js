module.exports = async function handler(req, res) {
    // Validate request method
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['POST']
        });
    }
    
    try {
        // Validate environment configuration
        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey) {
            console.error('REPLICATE_API_TOKEN not configured');
            return res.status(500).json({ 
                error: 'API key not configured',
                message: 'Please configure REPLICATE_API_TOKEN in Vercel environment variables'
            });
        }
        
        // Validate request body
        const { imageData, fileName, contentType } = req.body;
        if (!imageData) {
            return res.status(400).json({ 
                error: 'Image data required',
                message: 'Please provide imageData in request body'
            });
        }
        
        // Convert base64 to buffer
        const buffer = Buffer.from(imageData, 'base64');
        
        // Create FormData using proper API
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', buffer, {
            filename: fileName || 'house-facade.jpg',
            contentType: contentType || 'image/jpeg'
        });
        
        // Upload to Replicate
        const response = await fetch('https://api.replicate.com/v1/uploads', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                ...form.getHeaders()
            },
            body: form
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Replicate upload error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            return res.status(response.status).json({
                error: `Replicate upload failed: ${response.statusText}`,
                details: errorText
            });
        }
        
        const uploadData = await response.json();
        
        // Return success response
        res.status(200).json({
            success: true,
            uploadUrl: uploadData.upload_url,
            id: uploadData.id,
            message: 'Image uploaded successfully to Replicate'
        });
        
    } catch (error) {
        console.error('Upload handler error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process upload request',
            details: error.message
        });
    }
}
