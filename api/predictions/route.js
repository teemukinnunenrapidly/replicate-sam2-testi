import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { imageData, promptType, pointsPerSide, predIouThresh, stabilityScoreThresh } = await request.json();
    
    if (!imageData) {
      return NextResponse.json(
        { detail: "Image data is required" },
        { status: 400 }
      );
    }

    console.log('Creating SAM-2 prediction with:', {
      promptType,
      pointsPerSide,
      predIouThresh,
      stabilityScoreThresh
    });

    // SAM-2 model version - Meta SAM-2
    const SAM2_MODEL = "meta/sam-2:2c7b381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329";
    
    const prediction = await replicate.predictions.create({
      version: SAM2_MODEL,
      input: {
        image: imageData, // This should be a data URL or HTTP URL
        prompt_type: promptType || "text",
        points_per_side: parseInt(pointsPerSide) || 32,
        pred_iou_thresh: parseFloat(predIouThresh) || 0.88,
        stability_score_thresh: parseFloat(stabilityScoreThresh) || 0.95
      }
    });

    console.log('SAM-2 prediction created:', prediction);
    
    return NextResponse.json(prediction, { status: 201 });
    
  } catch (error) {
    console.error('Prediction creation error:', error);
    return NextResponse.json(
      { detail: error.message },
      { status: 500 }
    );
  }
}
