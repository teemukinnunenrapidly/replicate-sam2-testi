export default async function handler(req, res) {
    // Tarkista että on POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Hae API key environment variablesta
        const apiKey = process.env.REPLICATE_API_TOKEN;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Hae kuva request body:stä
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: 'Image data required' });
        }

        // Lähetä kuva Replicate:lle
        const response = await fetch('https://api.replicate.com/v1/uploads', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'house-facade.jpg',
                content_type: 'image/jpeg'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Replicate upload error:', errorText);
            return res.status(response.status).json({ 
                error: `Replicate upload failed: ${response.statusText}` 
            });
        }

        const uploadData = await response.json();
        
        // Palauta upload URL
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
