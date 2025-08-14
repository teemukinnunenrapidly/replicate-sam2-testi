const Replicate = require('replicate');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ 
        detail: "REPLICATE_API_TOKEN environment variable is not set" 
      });
    }

    // Get prediction ID from query parameter
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        detail: "Prediction ID is required" 
      });
    }

    console.log("Getting prediction status for ID:", id);
    
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(id);

    if (prediction?.error) {
      console.error("Prediction error:", prediction.error);
      return res.status(500).json({ 
        detail: prediction.error 
      });
    }

    console.log("Prediction status:", prediction.status);
    console.log("Prediction output:", prediction.output);
    
    res.status(200).json(prediction);
    
  } catch (error) {
    console.error("Prediction status check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    res.status(500).json({ 
      detail: errorMessage 
    });
  }
};
