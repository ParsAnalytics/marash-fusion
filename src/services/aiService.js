import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const hasKey = Boolean(apiKey);
const genAI = hasKey ? new GoogleGenerativeAI(apiKey) : null;

function parseDataUrl(dataUrl) {
  const commaIndex = dataUrl.indexOf(',');
  const prefix = dataUrl.substring(0, commaIndex);
  const data = dataUrl.substring(commaIndex + 1);
  const mimeMatch = prefix.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  return { mimeType, data };
}

function extractJSON(text) {
  try {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from AI response:", text);
    throw new Error("Invalid JSON response from AI");
  }
}

export const aiService = {
  async extractRecipeFromImage(imageData) {
    if (!hasKey) {
      throw new Error("Gemini API key is missing. Cannot use AI features.");
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const { mimeType, data } = parseDataUrl(imageData);
      
      const prompt = `You are a culinary AI assistant. Look at this photo of a printed or handwritten recipe.
      Extract the recipe details and format the response STRICTLY as a JSON object with the following structure:
      {
        "title": "Recipe Title",
        "ingredients": [
          { "name": "Ingredient Name", "amount": "Quantity/Amount (e.g., 2 tbsp)" }
        ],
        "instructions": "Full instructions text. Keep newlines if there are multiple steps."
      }
      If some parts are unreadable, try your best to guess or leave them empty. Do NOT include markdown blocks, just return the JSON.`;

      const imageParts = [{ inlineData: { data, mimeType } }];
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      return extractJSON(text);
    } catch (err) {
      console.error("Gemini Vision Recipe Extraction Error:", err);
      throw err;
    }
  }
};
