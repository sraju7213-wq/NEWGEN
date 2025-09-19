const { GEMINI_API_KEY } = process.env;

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'models/gemini-1.5-pro-latest';

async function callGemini({ model = DEFAULT_MODEL, contents, generationConfig }) {
  if (!GEMINI_API_KEY) {
    const combinedText = contents
      .flatMap((content) => content.parts || [])
      .map((part) => part.text)
      .join('\n');

    return {
      raw: { mock: true, contents, generationConfig },
      text: `Mock Gemini response based on: ${combinedText.slice(0, 200)}`
    };
  }

  const url = `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const candidates = data.candidates || [];
  const text = candidates
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n');

  return {
    raw: data,
    text
  };
}

async function generatePromptFromSeed(seedPrompt, context = '') {
  return callGemini({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a creative prompt based on the following input. Ensure the prompt is detailed and actionable.\n\nInput:${seedPrompt}\n\nContext:${context}`
          }
        ]
      }
    ]
  });
}

async function refinePrompt(promptText) {
  return callGemini({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Improve the following prompt by making it more engaging, clear, and context-aware. Provide the revised prompt and list of suggested edits.\n\nPrompt:${promptText}`
          }
        ]
      }
    ]
  });
}

async function chatWithGemini(messages) {
  const contents = messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }]
  }));
  return callGemini({ contents });
}

async function batchGeneratePrompts({ theme, keywords = [], count = 5, tone = 'creative' }) {
  const keywordList = keywords.join(', ');
  return callGemini({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Create ${count} distinct prompts for the theme "${theme}" using the following keywords: ${keywordList}. Use a ${tone} tone. Return the prompts as a numbered list.`
          }
        ]
      }
    ]
  });
}

module.exports = {
  callGemini,
  generatePromptFromSeed,
  refinePrompt,
  chatWithGemini,
  batchGeneratePrompts
};
