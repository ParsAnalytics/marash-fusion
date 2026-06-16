import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CheckCircle } from 'lucide-react';
import { aiService } from '../services/aiService';
import { recipeStore } from '../store/recipeStore';

export default function PantryScanner({ onRecipeAdded }) {
  const [photo, setPhoto] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPhoto(reader.result);
        await analyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const aiResult = await aiService.generateRecipeFromImage(imageData);
      setResult(aiResult);
    } catch (err) {
      console.error('Failed to analyze image', err);
      alert('Failed to analyze image with Gemini Vision.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveGeneratedRecipe = async () => {
    if (!result) return;
    
    setIsSaving(true);
    const newRecipe = {
      title: result.suggestedRecipe.title,
      ingredients: result.detectedIngredients.map(ing => ({ name: ing, amount: 'As needed' })),
      instructions: result.suggestedRecipe.description + '\n\n' + result.suggestedRecipe.instructions,
      photos: photo ? [photo] : [] // Save the fridge/counter photo as the recipe photo for memory
    };

    try {
      await recipeStore.addRecipe(newRecipe);
      if (onRecipeAdded) onRecipeAdded();
    } catch (err) {
      console.error('Failed to save recipe', err);
      alert('Failed to save recipe.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pantry-scanner-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {!photo && (
        <div className="zen-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Camera size={48} color="var(--color-matcha-accent)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '1rem' }}>Scan Ingredients</h3>
          <p style={{ color: 'var(--color-ink-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            Take a photo of your fridge, pantry, or counter. Gemini Vision will identify the ingredients and craft a unique fusion recipe for you.
          </p>
          
          <button 
            className="zen-button" 
            onClick={() => fileInputRef.current.click()}
          >
            <ImageIcon size={20} />
            Upload Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
          />
        </div>
      )}

      {photo && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="zen-card" style={{ padding: '0', overflow: 'hidden' }}>
             <div 
              style={{ 
                width: '100%', 
                height: '300px', 
                backgroundImage: `url(${photo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <button 
                className="zen-button outline" 
                onClick={() => { setPhoto(null); setResult(null); }}
              >
                Scan Another Image
              </button>
            </div>
          </div>

          <div className="zen-card">
            {isAnalyzing ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Sparkles size={40} color="var(--color-matcha-accent)" className="spinning-icon" style={{ margin: '0 auto 1rem' }} />
                <h3>Gemini is thinking...</h3>
                <p style={{ color: 'var(--color-ink-secondary)' }}>Analyzing your ingredients and designing a recipe.</p>
              </div>
            ) : result ? (
              <div>
                <h3 style={{ borderBottom: '1px solid var(--color-bamboo-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-matcha-accent)' }}>
                  <Sparkles size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/>
                  {result.suggestedRecipe.title}
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-ink-secondary)', textTransform: 'uppercase' }}>Detected Ingredients:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {result.detectedIngredients.map((ing, idx) => (
                      <span key={idx} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-washi-bg)', border: '1px solid var(--color-bamboo)', borderRadius: '4px' }}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--color-ink-secondary)' }}>{result.suggestedRecipe.description}</p>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-washi-bg)', borderRadius: 'var(--radius-soft)' }}>
                    {result.suggestedRecipe.instructions}
                  </div>
                </div>

                <button 
                  className="zen-button" 
                  onClick={saveGeneratedRecipe}
                  disabled={isSaving}
                  style={{ width: '100%' }}
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      <CheckCircle size={18} /> Save This Recipe
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
