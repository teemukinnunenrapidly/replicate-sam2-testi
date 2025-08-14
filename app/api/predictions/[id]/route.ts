import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

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
  created_at?: string;
  completed_at?: string;
  metrics?: {
    predict_time: number;
  };
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PredictionResponse | { detail: string }>> {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { detail: "REPLICATE_API_TOKEN environment variable is not set" },
        { status: 500 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { detail: "Prediction ID is required" },
        { status: 400 }
      );
    }

    console.log("Getting prediction status for ID:", id);
    
    const prediction = await replicate.predictions.get(id);

    if (prediction?.error) {
      console.error("Prediction error:", prediction.error);
      return NextResponse.json(
        { detail: prediction.error },
        { status: 500 }
      );
    }

    console.log("Prediction status:", prediction.status);
    console.log("Prediction output:", prediction.output);
    
    // Return prediction with proper typing
    return NextResponse.json(prediction as PredictionResponse);
    
  } catch (error) {
    console.error("Prediction status check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { detail: errorMessage },
      { status: 500 }
    );
  }
}
