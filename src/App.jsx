import { useState, useEffect } from 'react';
import { ChefHat, BookOpen, PlusCircle } from 'lucide-react';
import Gallery from './components/Gallery';
import AddRecipe from './components/AddRecipe';
import RecipeDetails from './components/RecipeDetails';
import KnowledgeBase from './components/KnowledgeBase';
import PantryScanner from './components/PantryScanner';
import { Camera } from 'lucide-react';
import { loadMockData } from './utils/mockData';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('gallery'); // 'gallery', 'add', 'knowledge', 'details', 'pantry'
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const initData = async () => {
      await loadMockData();
      setDataLoaded(true);
    };
    initData();
  }, []);

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('details');
  };

  const handleRecipeAddedOrDeleted = () => {
    setCurrentView('gallery');
  };

  if (!dataLoaded) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Zen Kitchen...</div>;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container header-content">
          <a href="#" className="logo" onClick={() => setCurrentView('gallery')}>
            <ChefHat size={28} color="var(--color-matcha-accent)" />
            Marash<span>Fusion</span>
          </a>
          
          <nav className="nav-links">
            <span 
              className={`nav-link ${(currentView === 'gallery' || currentView === 'details') ? 'active' : ''}`}
              onClick={() => setCurrentView('gallery')}
            >
              Recipe Gallery
            </span>
            <span 
              className={`nav-link ${currentView === 'pantry' ? 'active' : ''}`}
              onClick={() => setCurrentView('pantry')}
            >
              <Camera size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/>
              Pantry Scan
            </span>
            <span 
              className={`nav-link ${currentView === 'knowledge' ? 'active' : ''}`}
              onClick={() => setCurrentView('knowledge')}
            >
              <BookOpen size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/>
              Knowledge Base
            </span>
            <button 
              className="zen-button"
              onClick={() => setCurrentView('add')}
            >
              <PlusCircle size={18} />
              New Recipe
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main container">
        {currentView === 'gallery' && (
          <div className="view-gallery">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Your Culinary Collection</h2>
            <p style={{ color: 'var(--color-ink-secondary)', textAlign: 'center', marginBottom: '3rem' }}>A minimalist space for your fusion creations.</p>
            <Gallery onViewRecipe={handleViewRecipe} />
          </div>
        )}

        {currentView === 'details' && selectedRecipe && (
          <RecipeDetails 
            recipe={selectedRecipe} 
            onBack={() => setCurrentView('gallery')} 
            onDelete={handleRecipeAddedOrDeleted}
          />
        )}

        {currentView === 'pantry' && (
          <div className="view-pantry">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Pantry & Counter Scan</h2>
            <PantryScanner onRecipeAdded={handleRecipeAddedOrDeleted} />
          </div>
        )}

        {currentView === 'add' && (
          <div className="view-add">
            <h2 style={{ marginBottom: '2rem' }}>Create New Recipe</h2>
            <AddRecipe onRecipeAdded={handleRecipeAddedOrDeleted} />
          </div>
        )}

        {currentView === 'knowledge' && (
          <div className="view-knowledge">
            <KnowledgeBase />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>Marash Fusion &copy; {new Date().getFullYear()}. Crafted with minimalist Zen philosophy.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
