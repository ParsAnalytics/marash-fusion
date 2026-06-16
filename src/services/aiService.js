import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Create a mock client if no key is found, to prevent the app from crashing entirely
const hasKey = Boolean(apiKey);
const genAI = hasKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to safely extract base64 from a data URL
function parseDataUrl(dataUrl) {
  const commaIndex = dataUrl.indexOf(',');
  const prefix = dataUrl.substring(0, commaIndex);
  const data = dataUrl.substring(commaIndex + 1);
  const mimeMatch = prefix.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  return { mimeType, data };
}

// Helper to safely extract JSON from Gemini text response
function extractJSON(text) {
  try {
    // Try to find the first '{' and last '}' or first '[' and last ']'
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
  async parseDocumentWithGemini(fileData, fileType) {
    if (!hasKey) {
      console.warn("No Gemini API key found. Returning mock data.");
      return { success: true, extractedText: "Mocked document", flavorProfile: ["Umami", "Earthy", "Salty"] };
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const { mimeType, data } = parseDataUrl(fileData);
      
      const prompt = `Analyze this culinary document or image. 
      Extract the main culinary themes and provide a list of exactly 3 to 5 core flavor profile words or dominant ingredients that define it (e.g., Umami, Citrussy, Garlic, Miso). 
      Format the response strictly as a JSON object: 
      { 
        "summary": "A 1 sentence summary", 
        "flavorProfile": ["flavor1", "flavor2", "flavor3"] 
      }`;

      const imageParts = [
        {
          inlineData: {
            data: data,
            mimeType: mimeType
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      const parsed = extractJSON(text);
      return {
        success: true,
        extractedText: parsed.summary || "No summary provided",
        flavorProfile: parsed.flavorProfile || ["Unknown"]
      };

    } catch (err) {
      console.error("Gemini Document Parse Error Details:", err);
      throw err;
    }
  },

  async suggestPairingsWithGemini(currentIngredients) {
    if (!hasKey) {
      return [
        { ingredient: "Miso", reason: "Adds a deep, savory umami flavor that balances sweetness.", exampleRecipe: "Miso Glazed Eggplant" },
        { ingredient: "Truffle Oil", reason: "Provides an earthy aroma that elevates simple starches.", exampleRecipe: "Truffle Mushroom Risotto" }
      ]; // Mock fallback
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `I am making a fusion recipe with these ingredients: ${currentIngredients.join(', ')}. 
      Suggest exactly 3 creative and unexpected ingredients to add that would pair perfectly with them. 
      Format the response strictly as a JSON array of objects, like this:
      [
        {
          "ingredient": "Name of the ingredient",
          "reason": "A short, 1-sentence explanation of why it pairs well with the current ingredients.",
          "exampleRecipe": "A name of a famous or fusion recipe where this combination is used."
        }
      ]`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return extractJSON(text);
    } catch (err) {
      console.error("Gemini Pairing Error Details:", err);
      return [];
    }
  },

  async generateRecipeFromImage(imageData) {
    if (!hasKey) {
      return {
        detectedIngredients: ["Eggs", "Tomatoes", "Onion", "Green Pepper"],
        suggestedRecipe: {
          title: "Zen Menemen Fusion",
          description: "A minimalist take on the classic Turkish breakfast.",
          instructions: "1. Sauté onions and peppers.\n2. Add chopped tomatoes.\n3. Crack eggs and gently fold."
        }
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const { mimeType, data } = parseDataUrl(imageData);
      
      const prompt = `Look at this photo of ingredients from a fridge or counter. 
      1. Identify the key edible ingredients you can see.
      2. Invent a creative "Fusion" recipe using ONLY some or all of these ingredients (plus basic pantry staples like oil, salt, pepper if needed).
      Format the response strictly as a JSON object:
      {
        "detectedIngredients": ["ingredient1", "ingredient2"],
        "suggestedRecipe": {
          "title": "Creative Fusion Recipe Name",
          "description": "A 1-2 sentence description of the dish",
          "instructions": "Step by step instructions formatted with newlines"
        }
      }`;

      const imageParts = [
        {
          inlineData: {
            data: data,
            mimeType: mimeType
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      return extractJSON(text);

    } catch (err) {
      console.error("Gemini Vision Recipe Error Details:", err);
      throw err;
    }
  }
};
