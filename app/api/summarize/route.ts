import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { ALL_CATEGORIES, MemoryCategory } from '@/lib/memory-types';

const LANGUAGE_NAME_MAP: Record<string, string> = {
  vi: 'Vietnamese',
  en: 'English',
  ja: 'Japanese',
  zh: 'Simplified Chinese',
  ko: 'Korean',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = typeof body?.content === 'string' ? body.content.trim() : '';
    const customTitle =
      typeof body?.title === 'string' ? body.title.trim() : '';
    const langCode = typeof body?.language === 'string' ? body.language : 'vi';
    const targetLanguage = LANGUAGE_NAME_MAP[langCode] || 'Vietnamese';

    if (!rawText || rawText.length < 10) {
      return NextResponse.json(
        {
          error: 'Please provide at least 10 characters of astronomical notes.',
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY is not configured.',
          code: 'MISSING_API_KEY',
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `You are an astrophysicist at the Gargantua 3D Galaxy & Black Hole Observatory. Analyze the following celestial object or astrophysical phenomenon to generate a new 3D orbital dossier:

"""
${rawText}
"""
${customTitle ? `\nSuggested Object Name: "${customTitle}"` : ''}

Mandatory requirements:
1. Write the "title" and all 3 bullet points in "summary" strictly in ${targetLanguage} (each bullet 14-30 words, accurate and engaging).
2. Classify "category" into EXACTLY one of these 7 enum keys (preserve the exact string):
   - "Ngôi sao & Hệ sao"
   - "Hành tinh Đại dương & Sự sống"
   - "Khổng lồ Khí & Siêu Vành Đai"
   - "Hành tinh Dung nham & Cực đoan"
   - "Thế giới Băng giá & Kỳ dị"
   - "Tiểu hành tinh, Mặt trăng & Sao chổi"
   - "Hố đen & Hiện tượng Thiên hà"
3. Extract exactly 3 lowercase English astronomical tags (e.g. black-hole, lensing, relativity, accretion, star, asteroid, comet, exoplanet, habitable-zone, ocean-world, ring-system, gas-giant, lava-world, cryo-world, jwst, kepler).`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: `Celestial body name and scientific epithet in ${targetLanguage}.`,
            },
            category: {
              type: Type.STRING,
              description:
                'Exact match to one of the 7 allowed category keys.',
            },
            summary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Exactly 3 concise astrophysical highlight bullets in ${targetLanguage}.`,
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 3 lowercase English astronomical tags.',
            },
          },
          required: ['title', 'category', 'summary', 'tags'],
        },
      },
    });

    const jsonText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(jsonText);

    const validCategory: MemoryCategory = ALL_CATEGORIES.includes(
      parsed.category as MemoryCategory
    )
      ? (parsed.category as MemoryCategory)
      : 'Hố đen & Hiện tượng Thiên hà';

    const bullets: [string, string, string] = [
      parsed.summary?.[0] ||
        'Orbital mechanics and structural profile inside the galactic gravitational field.',
      parsed.summary?.[1] ||
        'Atmospheric composition and thermal radiation measured via space spectroscopy.',
      parsed.summary?.[2] ||
        'Gravitational interaction with the central supermassive black hole.',
    ];

    const cleanTags: string[] = Array.isArray(parsed.tags)
      ? parsed.tags
          .slice(0, 3)
          .map((t: unknown) =>
            String(t)
              .toLowerCase()
              .replace(/^#/, '')
              .trim()
          )
          .filter(Boolean)
      : ['exoplanet', 'black-hole', 'relativity'];

    while (cleanTags.length < 3) {
      cleanTags.push(['exoplanet', 'black-hole', 'gargantua'][cleanTags.length]);
    }

    return NextResponse.json({
      title: customTitle || parsed.title || 'New Galactic Object',
      category: validCategory,
      summary: bullets,
      tags: cleanTags.slice(0, 3),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown Gemini API error';
    return NextResponse.json(
      { error: `Gemini API error (${message}).` },
      { status: 500 }
    );
  }
}
