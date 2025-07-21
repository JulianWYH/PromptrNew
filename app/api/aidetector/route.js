import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const buffer = Buffer.from(imageBase64, 'base64');

    const response = await fetch('https://api-inference.huggingface.co/models/haywoodsloan/ai-image-detector-deploy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'image/png', // Ensure correct MIME type
      },
      body: buffer,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Hugging Face model error:', result);
      return NextResponse.json({ error: 'Failed to run AI detector model.' }, { status: 500 });
    }

    const labelRaw = result?.[0]?.label?.toLowerCase() || 'unknown';
    const scoreRaw = result?.[0]?.score ?? 0;
    const percentage = parseFloat((scoreRaw * 100).toFixed(2));

    let ranking;

    if (labelRaw === 'artificial') {
      ranking = percentage < 90 ? "Likely Used AI Generation" : "Most Likely Used AI Generation";
    } else if (labelRaw === 'real'){
      ranking = percentage < 90 ? "Likely No AI Generation Used" : "Most Likely No AI Generation Used";
    } else {
      ranking = "Uncertain Origin";
    }

    return NextResponse.json({
      result: `${ranking} (${percentage}%)`,
    });
  } catch (err) {
    console.error('AI detection route error:', err);
    return NextResponse.json({ error: 'AI detection failed' }, { status: 500 });
  }
}