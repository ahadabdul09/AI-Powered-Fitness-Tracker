/**
 * LLM client abstraction.
 * Supports Anthropic (Claude) or OpenAI (GPT) depending on LLM_PROVIDER env var.
 * Set LLM_PROVIDER=anthropic (default) or LLM_PROVIDER=openai in your .env file.
 */

const PROVIDER = (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();

async function callAnthropic({ systemPrompt, userPrompt }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block) => block.type === 'text');
  return textBlock?.text || '';
}

async function callOpenAI({ systemPrompt, userPrompt }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Generate a response from the configured LLM provider.
 * @param {{systemPrompt: string, userPrompt: string}} params
 * @returns {Promise<string>} raw text response from the model
 */
async function generateAIResponse({ systemPrompt, userPrompt }) {
  if (PROVIDER === 'openai') {
    return callOpenAI({ systemPrompt, userPrompt });
  }
  return callAnthropic({ systemPrompt, userPrompt });
}

module.exports = { generateAIResponse };
