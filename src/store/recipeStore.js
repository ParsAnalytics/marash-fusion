import localforage from 'localforage';

// Initialize the store
localforage.config({
  name: 'MarashFusion',
  storeName: 'recipes_store',
  description: 'Local storage for Marash Fusion recipes'
});

export const recipeStore = {
  async getRecipes() {
    try {
      const recipes = await localforage.getItem('recipes');
      return recipes || [];
    } catch (err) {
      console.error('Error getting recipes:', err);
      return [];
    }
  },

  async addRecipe(recipe) {
    try {
      const recipes = await this.getRecipes();
      const newRecipe = {
        ...recipe,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      recipes.push(newRecipe);
      await localforage.setItem('recipes', recipes);
      return newRecipe;
    } catch (err) {
      console.error('Error adding recipe:', err);
      throw err;
    }
  },

  async deleteRecipe(id) {
    try {
      let recipes = await this.getRecipes();
      recipes = recipes.filter(r => r.id !== id);
      await localforage.setItem('recipes', recipes);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      throw err;
    }
  },

  async updateRecipe(id, updatedData) {
    try {
      const recipes = await this.getRecipes();
      const index = recipes.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Recipe not found');
      
      const updatedRecipe = {
        ...recipes[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      recipes[index] = updatedRecipe;
      await localforage.setItem('recipes', recipes);
      return updatedRecipe;
    } catch (err) {
      console.error('Error updating recipe:', err);
      throw err;
    }
  }
};
