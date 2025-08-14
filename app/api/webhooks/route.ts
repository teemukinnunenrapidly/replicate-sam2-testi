import { NextRequest, NextResponse } from "next/server";

interface WebhookPayload {
  id: string;
  status: string;
  input: Record<string, any>;
  output?: any;
  error?: string;
  completed_at?: string;
  metrics?: {
    predict_time: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload: WebhookPayload = await request.json();
    
    console.log("Webhook received for prediction:", payload.id);
    console.log("Status:", payload.status);
    console.log("Output:", payload.output);
    
    if (payload.status === "succeeded") {
      console.log("Prediction completed successfully!");
      console.log("Metrics:", payload.metrics);
    } else if (payload.status === "failed") {
      console.error("Prediction failed:", payload.error);
    }
    
    // Here you could:
    // - Store results in database
    // - Send notifications
    // - Update UI via WebSocket
    // - Trigger other processes
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
