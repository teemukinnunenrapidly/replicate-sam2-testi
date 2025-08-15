const Replicate = require('replicate');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ 
        detail: "REPLICATE_API_TOKEN environment variable is not set" 
      });
    }

    const { imageData, promptType, pointsPerSide, predIouThresh, stabilityScoreThresh, modelId, inputData } = req.body;

    if (!imageData) {
      return res.status(400).json({ 
        detail: "Image data is required" 
      });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Jos modelId on annettu, kyseessä on maalaus (ei segmentointi)
    if (modelId) {
      console.log("Creating painting prediction with model:", modelId);
      
      // Mallin versiot
      const MODELS = {
        sdxl: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        controlnet: 'jagilley/controlnet-sdxl:ad20b5b6a29e0e3c8b58b5c2c0c0c0c0c0c0c0c',
        realistic: 'stability-ai/realistic-vision:5a7c381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329',
        sd15: 'stability-ai/stable-diffusion-2-inpainting:38a5b5b6a29e0e3c8b58b5c2c0c0c0c0c0c0c0c',
        dreamshaper: 'cjwbw/dreamshaper:5a7c381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329'
      };

      const modelVersion = MODELS[modelId];
      if (!modelVersion) {
        return res.status(400).json({ 
          detail: `Unknown model: ${modelId}` 
        });
      }

      const prediction = await replicate.predictions.create({
        version: modelVersion,
        input: inputData || {},
      });

      console.log("Painting prediction created:", prediction);
      res.status(201).json(prediction);
      return;
    }

    // Muussa tapauksessa kyseessä on SAM-2 segmentointi
    console.log("Creating SAM-2 prediction with:", {
      promptType: promptType || "text",
      pointsPerSide: pointsPerSide || 32,
      predIouThresh: predIouThresh || 0.88,
      stabilityScoreThresh: stabilityScoreThresh || 0.95,
    });

    // SAM-2 model version - latest working version
    const SAM2_MODEL = "meta/sam-2:fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83";

    const prediction = await replicate.predictions.create({
      version: SAM2_MODEL,
      input: {
        image: imageData,
        prompt_type: promptType || "text",
        points_per_side: pointsPerSide || 32,
        pred_iou_thresh: predIouThresh || 0.88,
        stability_score_thresh: stabilityScoreThresh || 0.95,
      },
    });

    console.log("SAM-2 prediction created:", prediction);

    res.status(201).json(prediction);

  } catch (error) {
    console.error("Prediction creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    res.status(500).json({ 
      detail: errorMessage 
    });
  }
};
