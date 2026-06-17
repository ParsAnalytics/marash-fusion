import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, ScanText, Sparkles, Camera } from 'lucide-react';
import { recipeStore } from '../store/recipeStore';
import { aiService } from '../services/aiService';

export default function AddRecipe({ onRecipeAdded }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [instructions, setInstructions] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const scanInputRef = useRef(null);

  const handleScanUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setIsScanning(true);
      try {
        const result = await aiService.extractRecipeFromImage(reader.result);
        if (result.title) setTitle(result.title);
        if (result.ingredients && result.ingredients.length > 0) {
          setIngredients(result.ingredients);
        }
        if (result.instructions) setInstructions(result.instructions);
        
        // Save the scanned document as the first photo
        setPhotos(prev => [reader.result, ...prev]);
      } catch (err) {
        console.error(err);
        alert(`Failed to read the recipe. Error: ${err.message || err}`);
      } finally {
        setIsScanning(false);
        // Reset input so they can scan another one if needed
        if (scanInputRef.current) scanInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };
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
    <div>
      <div className="zen-card" style={{ maxWidth: '800px', margin: '0 auto 2rem', backgroundColor: 'rgba(126, 141, 105, 0.05)', border: '1px solid var(--color-matcha-accent)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-matcha-accent)', marginBottom: '0.5rem' }}>
          <ScanText size={20} /> Auto-Fill from Photo
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-secondary)', marginBottom: '1.5rem' }}>
          Have a printed recipe? Take a photo of it and our AI will automatically read the text and fill out the form below for you.
        </p>
        
        <button 
          type="button" 
          className="zen-button" 
          onClick={() => scanInputRef.current.click()}
          disabled={isScanning}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          {isScanning ? (
            <><Sparkles size={18} className="spinning-icon" /> Reading your recipe...</>
          ) : (
            <><Camera size={18} /> Upload or Scan Recipe</>
          )}
        </button>
        <input 
          type="file" 
          ref={scanInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          capture="environment"
          onChange={handleScanUpload}
        />
      </div>

      <form onSubmit={handleSubmit} className="zen-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
    </div>
  );
}
