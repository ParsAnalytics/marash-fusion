import { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { recipeStore } from '../store/recipeStore';
import { aiService } from '../services/aiService';

export default function AddRecipe({ onRecipeAdded }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [instructions, setInstructions] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const validNames = ingredients.map(i => i.name.trim()).filter(n => n.length > 2);
      if (validNames.length === 0) {
        setAiSuggestions([]);
        return;
      }

      setIsAiLoading(true);
      try {
        const suggestions = await aiService.suggestPairingsWithGemini(validNames);
        setAiSuggestions(suggestions);
      } catch (err) {
        console.error("AI suggestion failed", err);
      } finally {
        setIsAiLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 800); // Debounce
    return () => clearTimeout(timer);
  }, [ingredients]);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredientRow = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');

    const newRecipe = {
      title,
      ingredients: validIngredients,
      instructions,
      photos
    };

    try {
      await recipeStore.addRecipe(newRecipe);
      if (onRecipeAdded) onRecipeAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to save recipe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-recipe-grid">
      <form onSubmit={handleSubmit} className="zen-card">
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Recipe Title</label>
          <input 
            type="text" 
            className="zen-input" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., Matcha Tiramisu Fusion"
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Photos</label>
          <div 
            style={{ 
              border: '2px dashed var(--color-bamboo)', 
              borderRadius: 'var(--radius-soft)',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundImage: photos.length > 0 ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${photos[0]})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: photos.length > 0 ? 'white' : 'var(--color-ink-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => fileInputRef.current.click()}
          >
            {photos.length === 0 ? (
              <>
                <ImageIcon size={32} style={{ margin: '0 auto 0.5rem' }} />
                <p>Click to upload photos</p>
              </>
            ) : (
              <>
                <ImageIcon size={32} style={{ margin: '0 auto 0.5rem', color: 'white' }} />
                <p>{photos.length} photo(s) selected. Click to add more.</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ingredients</label>
          {ingredients.map((ing, index) => (
            <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <input 
                type="text" 
                className="zen-input" 
                placeholder="Ingredient name (e.g., Soy sauce)" 
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                style={{ flex: 2 }}
              />
              <input 
                type="text" 
                className="zen-input" 
                placeholder="Amount (e.g., 2 tbsp)" 
                value={ing.amount}
                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                style={{ flex: 1 }}
              />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredientRow(index)} style={{ color: 'var(--color-danger)' }}>
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredientRow} style={{ color: 'var(--color-matcha-accent)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            <Plus size={16} /> Add Ingredient
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Instructions</label>
          <textarea 
            className="zen-input" 
            rows={5}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="How to make this fusion wonder..."
          />
        </div>

        <button type="submit" className="zen-button" disabled={isSubmitting} style={{ width: '100%' }}>
          {isSubmitting ? 'Saving...' : 'Save Recipe'}
        </button>
      </form>

      {/* AI Panel Placeholder */}
      <div className="zen-card ai-panel" style={{ backgroundColor: 'rgba(126, 141, 105, 0.05)', border: '1px solid var(--color-bamboo-light)', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-matcha-accent)' }}>
          <Sparkles size={20} /> AI Chef Assistant
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-secondary)' }}>
          As you type ingredients, our Gemini AI will suggest fusion combinations based on your uploaded knowledge base.
        </p>
        
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: '1rem' }}>Suggested Pairings</h4>
          
          {isAiLoading ? (
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--color-ink-secondary)' }}>Thinking...</p>
          ) : aiSuggestions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {aiSuggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid var(--color-bamboo)',
                    borderRadius: 'var(--radius-soft)',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--color-matcha-accent)', fontSize: '1rem' }}>{suggestion.ingredient}</strong>
                    <button 
                      onClick={() => setIngredients([...ingredients, { name: suggestion.ingredient, amount: '' }])}
                      style={{ color: 'var(--color-matcha-hover)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}
                      title="Add to ingredients"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-primary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    {suggestion.reason}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-secondary)', fontStyle: 'italic', margin: 0 }}>
                    <strong>Example:</strong> {suggestion.exampleRecipe}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--color-ink-secondary)' }}>Start typing ingredients to get ideas...</p>
          )}
        </div>
      </div>
    </div>
  );
}
