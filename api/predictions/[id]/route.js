import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { detail: "Prediction ID is required" },
        { status: 400 }
      );
    }

    console.log('Getting prediction status for ID:', id);
    
    const prediction = await replicate.predictions.get(id);

    if (prediction?.error) {
      console.error('Prediction error:', prediction.error);
      return NextResponse.json(
        { detail: prediction.error },
        { status: 500 }
      );
    }

    console.log('Prediction status:', prediction.status);
    return NextResponse.json(prediction);
    
  } catch (error) {
    console.error('Prediction status check error:', error);
    return NextResponse.json(
      { detail: error.message },
      { status: 500 }
    );
  }
}
