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
        
        // Muunna base64 buffer:ksi - EI temp fileja!
        const buffer = Buffer.from(imageData, 'base64');
        
        // Luo multipart/form-data manuaalisesti
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const formData = [];
        
        // Lisää tiedosto suoraan bufferista
        formData.push(
            `--${boundary}`,
            `Content-Disposition: form-data; name="file"; filename="${fileName || 'house-facade.jpg'}"`,
            `Content-Type: ${contentType || 'image/jpeg'}`,
            '',
            buffer.toString('binary'),
            `--${boundary}--`
        );
        
        const body = formData.join('\r\n');
        
        // Lähetä kuva Replicate:lle
        const response = await fetch('https://api.replicate.com/v1/uploads', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body)
            },
            body: body
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Replicate upload error:', errorText);
            return res.status(response.status).json({
                error: `Replicate upload failed: ${response.statusText}`
            });
        }
        
        const uploadData = await response.json();
        res.status(200).json({
            success: true,
            uploadUrl: uploadData.upload_url,
            id: uploadData.id
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: `Upload failed: ${error.message}`
        });
    }
}
