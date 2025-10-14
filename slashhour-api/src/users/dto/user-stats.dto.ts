export interface UserStatsDto {
  totalSavings: number;
  monthlySavings: number;
  totalRedemptions: number;
  monthlyRedemptions: number;
  categoriesUsed: number;
  totalCategories: number;
  followingCount: number;
  favoriteCategories?: string[];
  mostSavedBusiness?: {
    businessId: string;
    businessName: string;
    totalSaved: number;
  };
  savingsVsGoal?: {
    goal: number;
    achieved: number;
    percentage: number;
  };
}
