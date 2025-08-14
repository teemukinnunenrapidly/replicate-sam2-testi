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
        
        // Convert base64 to buffer
        const buffer = Buffer.from(imageData, 'base64');
        
        // Create multipart/form-data with proper binary handling
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        
        // Build multipart body with proper line endings and binary data
        const formData = Buffer.concat([
            Buffer.from(`--${boundary}\r\n`),
            Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName || 'house-facade.jpg'}"\r\n`),
            Buffer.from(`Content-Type: ${contentType || 'image/jpeg'}\r\n`),
            Buffer.from('\r\n'),
            buffer,
            Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);
        
        // Upload to Replicate
        const response = await fetch('https://api.replicate.com/v1/uploads', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': formData.length.toString()
            },
            body: formData
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
        
        // Return success response with upload URL
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
