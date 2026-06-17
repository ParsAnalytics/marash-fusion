import { useState } from 'react';
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { recipeStore } from '../store/recipeStore';

export default function RecipeDetails({ recipe, onBack, onDelete }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!recipe) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      await recipeStore.deleteRecipe(recipe.id);
      if (onDelete) onDelete();
    }
  };

  const safePhotos = recipe.photos || (recipe.photo ? [recipe.photo] : []);
  const hasPhotos = safePhotos.length > 0;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % safePhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  };

  return (
    <div className="recipe-details-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-ink-secondary)', marginBottom: '2rem' }}
      >
        <ArrowLeft size={20} /> Back to Gallery
      </button>

      <div className="zen-card" style={{ padding: '0', overflow: 'hidden' }}>
        {hasPhotos && (
          <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: 'var(--color-washi-bg)' }}>
            <div 
              style={{ 
                width: '100%', 
                height: '100%', 
                backgroundImage: `url(${safePhotos[currentPhotoIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.3s ease-in-out'
              }}
            />
            {safePhotos.length > 1 && (
              <>
                <button 
                  onClick={prevPhoto}
                  style={{
                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextPhoto}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={24} />
                </button>
                <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
                  {safePhotos.map((_, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        backgroundColor: idx === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.5)' 
                      }} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="recipe-details-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {recipe.recipeCode && <span style={{ backgroundColor: 'var(--color-washi-bg)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', color: 'var(--color-ink-secondary)', fontWeight: 'bold' }}>{recipe.recipeCode}</span>}
              <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0' }}>{recipe.title}</h1>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', color: 'var(--color-ink-secondary)' }}>
                {recipe.yieldAmount && <span><strong>Yield:</strong> {recipe.yieldAmount}</span>}
                {recipe.totalCost && <span><strong>Total Cost:</strong> {recipe.totalCost}</span>}
                {recipe.portionCost && <span><strong>Portion Cost:</strong> {recipe.portionCost}</span>}
              </div>
            </div>
            <button 
              onClick={handleDelete}
              style={{ color: 'var(--color-danger)', padding: '0.5rem' }}
              title="Delete Recipe"
            >
              <Trash2 size={24} />
            </button>
          </div>

          <div className="recipe-details-grid">
            <div>
              <h3 style={{ borderBottom: '1px solid var(--color-bamboo-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Ingredients
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px dashed var(--color-washi-bg)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ing.name}</span>
                    <span style={{ color: 'var(--color-ink-secondary)' }}>{ing.amount}</span>
                  </li>
                ))}
              </ul>

              {(recipe.allergens?.contains || recipe.allergens?.mayContain || recipe.allergens?.doesNotContain) && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--color-bamboo-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    Allergens
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    {recipe.allergens.contains && (
                      <div style={{ backgroundColor: 'rgba(190,80,70,0.1)', color: '#be5046', padding: '0.75rem', borderRadius: 'var(--radius-soft)' }}>
                        <strong>Contains:</strong> {recipe.allergens.contains}
                      </div>
                    )}
                    {recipe.allergens.mayContain && (
                      <div style={{ backgroundColor: 'rgba(210,153,34,0.1)', color: '#d29922', padding: '0.75rem', borderRadius: 'var(--radius-soft)' }}>
                        <strong>May Contain:</strong> {recipe.allergens.mayContain}
                      </div>
                    )}
                    {recipe.allergens.doesNotContain && (
                      <div style={{ backgroundColor: 'rgba(126,141,105,0.1)', color: 'var(--color-matcha-accent)', padding: '0.75rem', borderRadius: 'var(--radius-soft)' }}>
                        <strong>Does Not Contain:</strong> {recipe.allergens.doesNotContain}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ borderBottom: '1px solid var(--color-bamboo-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Instructions
              </h3>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {recipe.instructions || <span style={{ color: 'var(--color-ink-secondary)', fontStyle: 'italic' }}>No instructions provided.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
