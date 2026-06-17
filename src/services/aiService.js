import Tesseract from 'tesseract.js';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const hasKey = Boolean(apiKey);

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
      throw new Error("Groq API key is missing. Please add VITE_GROQ_API_KEY.");
    }

    try {
      console.log("Starting Tesseract OCR...");
      // Step 1: Use Tesseract.js to extract raw text from the image
      const { data: { text: rawText } } = await Tesseract.recognize(
        imageData,
        'eng+tur', // Support English and Turkish
        { logger: m => console.log(m) }
      );
      
      console.log("OCR Extracted Text:", rawText);

      if (!rawText || rawText.trim() === '') {
        throw new Error("No text could be found in the image. Please make sure the text is clear.");
      }

      // Step 2: Use Groq (llama-3.3-70b-versatile) to structure the raw text into JSON
      const prompt = `You are a culinary AI assistant processing a professional recipe sheet. 
      I have extracted the following raw text from a recipe photo using OCR.
      
      RAW TEXT:
      """
      ${rawText}
      """
      
      Please format this recipe STRICTLY as a JSON object with the following structure:
      {
        "recipeCode": "Code like R08796, or empty string",
        "title": "Recipe Title (e.g. MUGHLAI COCONUT VEGETABLE CURRY)",
        "yield": "Portion size/yield (e.g. 20 Ptn)",
        "totalCost": "Total cost (e.g. 24.12), or empty string",
        "portionCost": "Portion cost (e.g. 1.21), or empty string",
        "ingredients": [
          { "name": "Ingredient Description", "amount": "Quantity/Amount (e.g., 300g)" }
        ],
        "method": "Full instructions text for the Method section. Keep newlines if there are multiple steps.",
        "allergens": {
          "contains": "List of allergens it contains, e.g. Sulphur Dioxide",
          "mayContain": "List of allergens it may contain, e.g. Cereals, Mustard",
          "doesNotContain": "List of allergens it does not contain"
        }
      }
      If some parts are missing or messy, try your best to clean them up. Leave fields empty if not found. Do NOT include markdown blocks, just return the JSON.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const text = result.choices[0].message.content;
      console.log("Groq text parsing response:", text);
      
      return extractJSON(text);
    } catch (err) {
      console.error("Recipe Extraction Error:", err);
      if (err instanceof Error) {
        console.error("Error name:", err.name, "Message:", err.message, "Stack:", err.stack);
      }
      throw err;
    }
  }
};
