export interface UserStatsDto {
  total_savings: number;
  total_redemptions: number;
  monthly_savings: number;
  favorite_categories: string[];
  most_saved_business: {
    business_id: string;
    business_name: string;
    total_saved: number;
  } | null;
  savings_vs_goal: {
    goal: number;
    achieved: number;
    percentage: number;
  } | null;
}
