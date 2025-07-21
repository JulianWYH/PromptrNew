import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Fetch the image and convert it to base64
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Send the image for analysis
    const result = await model.generateContent([
      {
        text: `Analyze the provided image and describe any noticeable artifacts or inconsistencies that suggest AI generation. Summarize your findings in a straight to the point and concise manner and up to only 50 words. An example of a good response would be to point out the artifacts and inconsistencies, or even the realistic parts of the image, and finally determining and coming to a conclusion on if the image has AI-generation`,
      },
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image,
        },
      },
    ]);

    // Extract the textual output from Gemini
    const output = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Return the output as JSON
    return NextResponse.json({ analysis: output });
  } catch (err) {
    console.error("Gemini analyze error:", err);
    return NextResponse.json({ error: 'Image analysis failed' }, { status: 500 });
  }
}