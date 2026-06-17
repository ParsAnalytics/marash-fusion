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

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageData } }
              ]
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
      console.log("Groq Vision response text:", text);
      
      return extractJSON(text);
    } catch (err) {
      console.error("Groq Vision Recipe Extraction Error:", err);
      if (err instanceof Error) {
        console.error("Error name:", err.name, "Message:", err.message, "Stack:", err.stack);
      }
      throw err;
    }
  }
};
