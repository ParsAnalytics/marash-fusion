import { useState, useEffect } from 'react';
import { Search, ChefHat } from 'lucide-react';
import { recipeStore } from '../store/recipeStore';

export default function Gallery({ onViewRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setIsLoading(true);
    const data = await recipeStore.getRecipes();
    setRecipes(data);
    setIsLoading(false);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const term = searchTerm.toLowerCase();
    const matchTitle = recipe.title.toLowerCase().includes(term);
    const matchIngredients = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(term));
    return matchTitle || matchIngredients;
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading recipes...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-secondary)' }} />
          <input 
            type="text" 
            className="zen-input" 
            placeholder="Search by recipe name or ingredient..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem', borderRadius: 'var(--radius-round)' }}
          />
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="zen-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ChefHat size={48} color="var(--color-bamboo)" style={{ margin: '0 auto 1rem' }} />
          <p>No recipes yet. Begin your culinary journey by adding a new fusion recipe.</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No recipes found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filteredRecipes.map(recipe => (
            <div 
              key={recipe.id} 
              className="zen-card" 
              style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => onViewRecipe && onViewRecipe(recipe)}
            >
              <div 
                style={{ 
                  height: '200px', 
                  backgroundColor: 'var(--color-washi-bg)',
                  backgroundImage: recipe.photos && recipe.photos.length > 0 ? `url(${recipe.photos[0]})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {(!recipe.photos || recipe.photos.length === 0) && <ChefHat size={48} color="var(--color-bamboo)" />}
              </div>
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{recipe.title}</h3>
                <p style={{ color: 'var(--color-ink-secondary)', fontSize: '0.9rem', marginBottom: '0' }}>
                  {recipe.ingredients.length} ingredients
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
