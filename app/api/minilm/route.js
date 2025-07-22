import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HF_API_KEY);

export async function POST(req) {
  console.log('[MINILM-API] POST request received');
  try {
    const { text1, text2 } = await req.json();
    console.log('[MINILM-API] Received texts:', { text1: text1?.substring(0, 50), text2: text2?.substring(0, 50) });

    if (!text1 || !text2) {
      console.log('[MINILM-API] Missing required texts');
      return NextResponse.json({ error: 'Both text1 and text2 are required.' }, { status: 400 });
    }

    console.log('[MINILM-API] Calling HuggingFace API...');
    const result = await hf.sentenceSimilarity({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: {
        source_sentence: text1,
        sentences: [text2],
      },
    });

    const score = result?.[0];
    console.log('[MINILM-API] Similarity score:', score);

    if (typeof score !== 'number') {
      console.log('[MINILM-API] Invalid similarity result:', result);
      return NextResponse.json({ error: 'Invalid similarity result.' }, { status: 500 });
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error('[MINILM-API] Route error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}