// Category image mapping utility

const categoryImages = {
  food: require('../../assets/categories/food.png'),
  electronics: require('../../assets/categories/electronics.png'),
  fashion: require('../../assets/categories/fashion.png'),
  beauty: require('../../assets/categories/beauty.png'),
  skincare: require('../../assets/categories/skincare.png'),
  cosmetics: require('../../assets/categories/beauty.png'),
  perfume: require('../../assets/categories/beauty.png'),
  default: require('../../assets/categories/default.png'),
};

export const getCategoryImage = (category?: string) => {
  if (!category) {
    return categoryImages.default;
  }

  // Normalize category name (lowercase, remove spaces)
  const normalizedCategory = category.toLowerCase().trim().replace(/\s+/g, '');

  // Check for exact match
  if (categoryImages[normalizedCategory as keyof typeof categoryImages]) {
    return categoryImages[normalizedCategory as keyof typeof categoryImages];
  }

  // Check for partial matches
  if (normalizedCategory.includes('food') || normalizedCategory.includes('restaurant') || normalizedCategory.includes('dining')) {
    return categoryImages.food;
  }
  if (normalizedCategory.includes('electronics') || normalizedCategory.includes('gadget') || normalizedCategory.includes('tech')) {
    return categoryImages.electronics;
  }
  if (normalizedCategory.includes('fashion') || normalizedCategory.includes('clothing') || normalizedCategory.includes('apparel')) {
    return categoryImages.fashion;
  }
  if (normalizedCategory.includes('beauty') || normalizedCategory.includes('cosmetic') || normalizedCategory.includes('skincare') || normalizedCategory.includes('perfume')) {
    return categoryImages.beauty;
  }

  // Return default if no match found
  return categoryImages.default;
};
