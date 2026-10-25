/**
 * Gemini LLM client
 *
 * .env:
 *
 * LLM_PROVIDER=gemini
 * GEMINI_API_KEY=your_api_key
 * GEMINI_MODEL=gemini-3.8-flash
 */

require('dotenv').config();

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

async function callGemini({ systemPrompt, userPrompt }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: systemPrompt || '',
            },
          ],
        },

        contents: [
          {
            role: 'user',
            parts: [
              {
                text: userPrompt,
              },
            ],
          },
        ],

        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 3000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gemini API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

  if (!text) {
    console.error('Gemini response:', JSON.stringify(data, null, 2));

    throw new Error('Gemini returned an empty response.');
  }

  console.log('Gemini response received successfully.');

  /*
   * Make sure the response is valid JSON.
   */
  try {
    JSON.parse(text);
  } catch (error) {
    console.error('Gemini returned invalid JSON:');
    console.error(text);

    throw new Error(
      'AI response could not be parsed as JSON.'
    );
  }

  return text;
}


/**
 * Main AI function used by the application.
 */
async function generateAIResponse({
  systemPrompt,
  userPrompt,
}) {
  return callGemini({
    systemPrompt,
    userPrompt,
  });
}


module.exports = {
  generateAIResponse,
};