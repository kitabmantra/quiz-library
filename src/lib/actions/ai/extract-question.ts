'use server'

import { getErrorMessage } from '@/lib/utils/get-error';
import OpenAI from 'openai';

export interface QuestionData {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  hint?: string;
  referenceUrl?: string;
  tags: string[];
  priority: number;
  subjectName: string;
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function extractQuestionsFromText(text: string, userPrompt?: string): Promise<QuestionData[]> {
    console.log("this is the api key",  process.env.OPENROUTER_API_KEY)
  try {
    let promptText = `Extract multiple-choice questions from this text.`;

    // Add user prompt FIRST if provided (high priority)
    if (userPrompt && userPrompt.trim()) {
      promptText = `IMPORTANT USER INSTRUCTIONS: ${userPrompt.trim()}\n\n${promptText}`;
    }

    promptText += ` Return ONLY a JSON array of objects with this exact structure:

{
  "question": string,
  "options": [string, string, string, string],
  "correctAnswer": number, // 0-3 index
  "difficulty": "easy" | "medium" | "hard",
  "hint"?: string, // optional
  "referenceUrl"?: string, // optional
  "tags": string[], // max 5 tags
  "priority": number, // 1-3 [3-high, 2-medium, 1-low]
  "subjectName": string
}

Rules: 
- Return ONLY a valid JSON array, no markdown or explanations.
- Exactly 4 options per question.
- correctAnswer must be an index between 0-3.
- Use Unicode superscript characters (e.g., x², 10³) instead of ^ or LaTeX formatting.
- If an image is not related to the question’s answer type, ignore it.
- If there is only a question with no options provided, create 4 reasonable options yourself.
- If any required fields are missing, add them yourself.
- Max 5 tags per question.


Text: ${text}`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image-preview:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText
            }
          ]
        }
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from AI');
    }

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/```json\n?/g, '');
    cleanedContent = cleanedContent.replace(/```\n?/g, '');
    cleanedContent = cleanedContent.trim();

    // Parse the JSON response
    const questions: QuestionData[] = JSON.parse(cleanedContent);

    // Post-process: enforce constraints
    const processedQuestions = questions.map(question => ({
      ...question,
      options: normalizeOptions(question.options),
      correctAnswer: question.correctAnswer >= 0 && question.correctAnswer <= 3 ? question.correctAnswer : 0,
      tags: question.tags.slice(0, 5), // Max 5 tags
      difficulty: question.difficulty || "medium",
      priority: question.priority || 3,
    }));

    return processedQuestions;

  } catch (error) {
    error = getErrorMessage(error);
    console.error('Error extracting questions:', error);
    throw new Error(`Failed to extract questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function normalizeOptions(options: string[]): string[] {
  const normalized = options
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);
  
  // Ensure exactly 4 options
  while (normalized.length < 4) {
    normalized.push('');
  }
  
  return normalized.slice(0, 4);
}

// Example usage function
export async function processPDFText(text: string): Promise<{
  text: string;
  questions: QuestionData[];
  metadata: {
    characters: number;
    words: number;
    lines: number;
  };
}> {
  const metadata = {
    characters: text.length,
    words: text.split(/\s+/).filter(word => word.length > 0).length,
    lines: text.split('\n').length,
  };

  const questions = await extractQuestionsFromText(text);

  return {
    text,
    questions,
    metadata,
  };
}

