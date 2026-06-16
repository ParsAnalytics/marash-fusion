import localforage from 'localforage';
import { recipeStore } from '../store/recipeStore';

export const loadMockData = async () => {
  const existingRecipes = await recipeStore.getRecipes();
  
  // Reload mock data if there are 2 or fewer recipes (meaning they are the old mock data)
  if (existingRecipes.length <= 2) {
    const mockRecipes = [
      {
        id: crypto.randomUUID(),
        title: "Matcha Tiramisu Fusion",
        ingredients: [
          { name: "Mascarpone", amount: "250g" },
          { name: "Matcha Powder", amount: "2 tbsp" },
          { name: "Ladyfingers", amount: "1 pack" },
          { name: "Yuzu Juice", amount: "1 tbsp" }
        ],
        instructions: "1. Whisk mascarpone with matcha powder and a hint of yuzu.\n2. Dip ladyfingers briefly in sweetened matcha tea.\n3. Layer the ladyfingers and mascarpone cream in a dish.\n4. Dust the top generously with extra matcha powder before serving.",
        photos: [
          "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1615486511484-92e172fc34ea?q=80&w=800&auto=format&fit=crop"
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Miso Glazed Eggplant Tacos",
        ingredients: [
          { name: "Eggplant", amount: "1 large" },
          { name: "White Miso", amount: "2 tbsp" },
          { name: "Corn Tortillas", amount: "4 pieces" },
          { name: "Pickled Red Onion", amount: "1/4 cup" }
        ],
        instructions: "1. Slice eggplant into thick rounds and roast until soft.\n2. Brush generously with a mixture of white miso, mirin, and a touch of sugar. Broil until caramelized.\n3. Serve in warm corn tortillas topped with pickled red onions and fresh cilantro.",
        photos: [
          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1604544655519-5777dfdbdf75?q=80&w=800&auto=format&fit=crop"
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Turkish Delight Cheesecake",
        ingredients: [
          { name: "Cream Cheese", amount: "500g" },
          { name: "Rose Water", amount: "1 tsp" },
          { name: "Pistachios", amount: "1/2 cup" },
          { name: "Biscuit Crumbs", amount: "2 cups" }
        ],
        instructions: "1. Mix biscuit crumbs with melted butter for the base.\n2. Blend cream cheese with sugar, eggs, and rose water.\n3. Fold in crushed pistachios.\n4. Bake at 160C for 45 mins. Chill overnight.",
        photos: [
          "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=800&auto=format&fit=crop"
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Spicy Gochujang Carbonara",
        ingredients: [
          { name: "Spaghetti", amount: "200g" },
          { name: "Gochujang", amount: "1 tbsp" },
          { name: "Egg Yolks", amount: "3" },
          { name: "Pancetta", amount: "100g" },
          { name: "Pecorino", amount: "1/2 cup" }
        ],
        instructions: "1. Fry pancetta until crispy.\n2. Mix egg yolks, pecorino, and gochujang in a bowl.\n3. Toss hot pasta with pancetta, then off the heat, stir in the egg mixture with pasta water to create a creamy sauce.",
        photos: [
          "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&auto=format&fit=crop"
        ],
        createdAt: new Date().toISOString()
      }
    ];

    await localforage.setItem('recipes', mockRecipes);
    console.log("Mock recipes loaded with multiple photos.");
  }

  // Load mock knowledge base documents
  const existingDocs = await localforage.getItem('knowledge_docs') || [];
  if (existingDocs.length === 0) {
    const mockDocs = [
      {
        id: crypto.randomUUID(),
        name: "Japanese Fermentation Secrets.pdf",
        type: "application/pdf",
        extractedProfile: ["Umami", "Miso", "Koji", "Salty"],
        dateAdded: new Date().toLocaleDateString()
      },
      {
        id: crypto.randomUUID(),
        name: "Mediterranean Herbs Guide.jpg",
        type: "image/jpeg",
        extractedProfile: ["Earthy", "Citrus", "Thyme", "Fresh"],
        dateAdded: new Date().toLocaleDateString()
      }
    ];
    await localforage.setItem('knowledge_docs', mockDocs);
    console.log("Mock documents loaded.");
  }
};
