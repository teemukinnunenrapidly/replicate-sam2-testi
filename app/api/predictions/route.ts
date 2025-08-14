import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

interface PredictionRequest {
  imageData: string;
  promptType: string;
  pointsPerSide: number;
  predIouThresh: number;
  stabilityScoreThresh: number;
}

interface PredictionResponse {
  id: string;
  status: string;
  input: Record<string, any>;
  output?: any;
  error?: string;
  urls?: {
    cancel: string;
    get: string;
  };
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest): Promise<NextResponse<PredictionResponse | { detail: string }>> {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { detail: "REPLICATE_API_TOKEN environment variable is not set" },
        { status: 500 }
      );
    }

    const body: PredictionRequest = await request.json();
    
    if (!body.imageData) {
      return NextResponse.json(
        { detail: "Image data is required" },
        { status: 400 }
      );
    }

    console.log("Creating SAM-2 prediction with:", {
      promptType: body.promptType,
      pointsPerSide: body.pointsPerSide,
      predIouThresh: body.predIouThresh,
      stabilityScoreThresh: body.stabilityScoreThresh,
    });

    // SAM-2 model version - Meta SAM-2
    const SAM2_MODEL = "meta/sam-2:2c7b381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329";
    
    // Create prediction with webhook support (optional)
    const predictionOptions: any = {
      version: SAM2_MODEL,
      input: {
        image: body.imageData,
        prompt_type: body.promptType || "text",
        points_per_side: body.pointsPerSide || 32,
        pred_iou_thresh: body.predIouThresh || 0.88,
        stability_score_thresh: body.stabilityScoreThresh || 0.95,
      },
    };

    // Add webhook if VERCEL_URL is available (production)
    if (process.env.VERCEL_URL) {
      const webhookUrl = `https://${process.env.VERCEL_URL}/api/webhooks`;
      predictionOptions.webhook = webhookUrl;
      predictionOptions.webhook_events_filter = ["completed"];
    }

    const prediction = await replicate.predictions.create(predictionOptions);

    console.log("SAM-2 prediction created:", prediction);
    
    return NextResponse.json(prediction as PredictionResponse, { status: 201 });
    
  } catch (error) {
    console.error("Prediction creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { detail: errorMessage },
      { status: 500 }
    );
  }
}
