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

    const { imageData, promptType, pointsPerSide, predIouThresh, stabilityScoreThresh } = req.body;

    if (!imageData) {
      return res.status(400).json({ 
        detail: "Image data is required" 
      });
    }

    console.log("Creating SAM-2 prediction with:", {
      promptType: promptType || "text",
      pointsPerSide: pointsPerSide || 32,
      predIouThresh: predIouThresh || 0.88,
      stabilityScoreThresh: stabilityScoreThresh || 0.95,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
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
