// 70+ common foods with macros per typical serving
export const FOOD_DATABASE = [
  // Proteins
  { name: 'Chicken Breast (6oz)', calories: 280, protein: 53, carbs: 0, fat: 6 },
  { name: 'Chicken Thigh (6oz)', calories: 320, protein: 40, carbs: 0, fat: 17 },
  { name: 'Ground Turkey (6oz)', calories: 300, protein: 42, carbs: 0, fat: 14 },
  { name: 'Ground Beef 90/10 (6oz)', calories: 340, protein: 46, carbs: 0, fat: 16 },
  { name: 'Ground Beef 80/20 (6oz)', calories: 430, protein: 40, carbs: 0, fat: 28 },
  { name: 'Salmon Fillet (6oz)', calories: 350, protein: 38, carbs: 0, fat: 20 },
  { name: 'Tuna (1 can)', calories: 120, protein: 28, carbs: 0, fat: 1 },
  { name: 'Shrimp (6oz)', calories: 170, protein: 36, carbs: 0, fat: 2 },
  { name: 'Tilapia (6oz)', calories: 220, protein: 44, carbs: 0, fat: 4 },
  { name: 'Steak Sirloin (6oz)', calories: 320, protein: 46, carbs: 0, fat: 14 },
  { name: 'Pork Chop (6oz)', calories: 310, protein: 44, carbs: 0, fat: 14 },
  { name: 'Turkey Breast Deli (4 slices)', calories: 120, protein: 20, carbs: 4, fat: 2 },
  { name: 'Bacon (3 strips)', calories: 130, protein: 9, carbs: 0, fat: 10 },

  // Eggs & Dairy
  { name: 'Whole Egg (1 large)', calories: 70, protein: 6, carbs: 0, fat: 5 },
  { name: 'Egg Whites (3 large)', calories: 50, protein: 11, carbs: 0, fat: 0 },
  { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 22, carbs: 8, fat: 0 },
  { name: 'Whole Milk (1 cup)', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: 'Cottage Cheese (1 cup)', calories: 220, protein: 28, carbs: 8, fat: 10 },
  { name: 'Cheddar Cheese (1oz)', calories: 110, protein: 7, carbs: 0, fat: 9 },
  { name: 'Mozzarella (1oz)', calories: 80, protein: 6, carbs: 1, fat: 6 },
  { name: 'Protein Shake (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { name: 'Whey Protein (2 scoops)', calories: 240, protein: 48, carbs: 6, fat: 2 },
  { name: 'Casein Protein (1 scoop)', calories: 120, protein: 24, carbs: 4, fat: 1 },

  // Grains & Carbs
  { name: 'White Rice (1 cup cooked)', calories: 210, protein: 4, carbs: 45, fat: 0 },
  { name: 'Brown Rice (1 cup cooked)', calories: 220, protein: 5, carbs: 45, fat: 2 },
  { name: 'Pasta (1 cup cooked)', calories: 220, protein: 8, carbs: 43, fat: 1 },
  { name: 'Oatmeal (1 cup cooked)', calories: 160, protein: 6, carbs: 27, fat: 3 },
  { name: 'Bread White (2 slices)', calories: 160, protein: 5, carbs: 30, fat: 2 },
  { name: 'Bread Whole Wheat (2 slices)', calories: 180, protein: 7, carbs: 32, fat: 3 },
  { name: 'Bagel (1 large)', calories: 280, protein: 10, carbs: 54, fat: 2 },
  { name: 'Tortilla Flour (1 large)', calories: 210, protein: 5, carbs: 36, fat: 5 },
  { name: 'Tortilla Corn (2 small)', calories: 110, protein: 3, carbs: 22, fat: 2 },
  { name: 'Sweet Potato (1 medium)', calories: 110, protein: 2, carbs: 26, fat: 0 },
  { name: 'Russet Potato (1 medium)', calories: 160, protein: 4, carbs: 37, fat: 0 },
  { name: 'Quinoa (1 cup cooked)', calories: 220, protein: 8, carbs: 39, fat: 4 },
  { name: 'Granola (1/2 cup)', calories: 210, protein: 5, carbs: 30, fat: 8 },

  // Fruits
  { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Apple (1 medium)', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: 'Orange (1 medium)', calories: 65, protein: 1, carbs: 16, fat: 0 },
  { name: 'Blueberries (1 cup)', calories: 85, protein: 1, carbs: 21, fat: 0 },
  { name: 'Strawberries (1 cup)', calories: 50, protein: 1, carbs: 12, fat: 0 },
  { name: 'Grapes (1 cup)', calories: 100, protein: 1, carbs: 27, fat: 0 },
  { name: 'Avocado (1/2)', calories: 160, protein: 2, carbs: 9, fat: 15 },

  // Vegetables
  { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 0 },
  { name: 'Spinach (2 cups raw)', calories: 14, protein: 2, carbs: 2, fat: 0 },
  { name: 'Mixed Salad (2 cups)', calories: 20, protein: 2, carbs: 4, fat: 0 },
  { name: 'Green Beans (1 cup)', calories: 35, protein: 2, carbs: 8, fat: 0 },
  { name: 'Carrots (1 cup)', calories: 50, protein: 1, carbs: 12, fat: 0 },
  { name: 'Bell Pepper (1 medium)', calories: 30, protein: 1, carbs: 7, fat: 0 },

  // Nuts, Seeds & Fats
  { name: 'Almonds (1oz / 23 nuts)', calories: 160, protein: 6, carbs: 6, fat: 14 },
  { name: 'Peanuts (1oz)', calories: 160, protein: 7, carbs: 5, fat: 14 },
  { name: 'Peanut Butter (2 tbsp)', calories: 190, protein: 8, carbs: 7, fat: 16 },
  { name: 'Almond Butter (2 tbsp)', calories: 200, protein: 7, carbs: 6, fat: 18 },
  { name: 'Olive Oil (1 tbsp)', calories: 120, protein: 0, carbs: 0, fat: 14 },
  { name: 'Butter (1 tbsp)', calories: 100, protein: 0, carbs: 0, fat: 11 },
  { name: 'Coconut Oil (1 tbsp)', calories: 120, protein: 0, carbs: 0, fat: 14 },
  { name: 'Walnuts (1oz)', calories: 185, protein: 4, carbs: 4, fat: 18 },

  // Snacks & Misc
  { name: 'Protein Bar', calories: 210, protein: 20, carbs: 22, fat: 8 },
  { name: 'Rice Cakes (2)', calories: 70, protein: 2, carbs: 15, fat: 0 },
  { name: 'Trail Mix (1/4 cup)', calories: 170, protein: 5, carbs: 15, fat: 11 },
  { name: 'Dark Chocolate (1oz)', calories: 170, protein: 2, carbs: 13, fat: 12 },
  { name: 'Hummus (2 tbsp)', calories: 70, protein: 2, carbs: 4, fat: 5 },
  { name: 'Chips (1oz)', calories: 150, protein: 2, carbs: 15, fat: 10 },
  { name: 'Popcorn (3 cups)', calories: 100, protein: 3, carbs: 19, fat: 1 },
  { name: 'Beef Jerky (1oz)', calories: 80, protein: 13, carbs: 3, fat: 1 },

  // Common Meals
  { name: 'Burrito Bowl', calories: 650, protein: 35, carbs: 70, fat: 22 },
  { name: 'Turkey Sandwich', calories: 380, protein: 28, carbs: 40, fat: 12 },
  { name: 'Grilled Chicken Salad', calories: 350, protein: 40, carbs: 15, fat: 14 },
  { name: 'Cheeseburger', calories: 550, protein: 30, carbs: 40, fat: 30 },
  { name: 'Pizza Slice (cheese)', calories: 280, protein: 12, carbs: 34, fat: 10 },
  { name: 'Sushi Roll (8 pieces)', calories: 350, protein: 15, carbs: 50, fat: 8 },
  { name: 'Chicken & Rice Bowl', calories: 500, protein: 45, carbs: 55, fat: 8 },
  { name: 'Steak & Potatoes', calories: 600, protein: 50, carbs: 40, fat: 20 },
  { name: 'Pasta with Meat Sauce', calories: 520, protein: 28, carbs: 60, fat: 18 },
  { name: 'Overnight Oats', calories: 350, protein: 15, carbs: 45, fat: 12 },
  { name: 'Smoothie Bowl', calories: 400, protein: 20, carbs: 55, fat: 10 },
]

export function fuzzySearch(query, foods = FOOD_DATABASE) {
  if (!query || query.length < 2) return foods.slice(0, 10)
  const lower = query.toLowerCase()
  const terms = lower.split(/\s+/)

  const scored = foods.map(food => {
    const name = food.name.toLowerCase()
    let score = 0

    // Exact substring match gets highest score
    if (name.includes(lower)) score += 100

    // Each term matching individually
    for (const term of terms) {
      if (name.includes(term)) score += 30
    }

    // Starts-with bonus
    if (name.startsWith(lower)) score += 50

    // Character-level fuzzy match
    if (score === 0) {
      let qi = 0
      for (let i = 0; i < name.length && qi < lower.length; i++) {
        if (name[i] === lower[qi]) qi++
      }
      if (qi === lower.length) score += 10
    }

    return { ...food, score }
  })

  return scored
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
}
