import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Brand = Tables["brands"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Source = Tables["sources"]["Row"];
export type Product = Tables["products"]["Row"];
export type ProductVariant = Tables["product_variants"]["Row"];
export type SpecificationGroup = Tables["specification_groups"]["Row"];
export type Specification = Tables["specifications"]["Row"];
export type ProductSpecification = Tables["product_specifications"]["Row"];
export type ProductImage = Tables["product_images"]["Row"];
export type Retailer = Tables["retailers"]["Row"];
export type Price = Tables["prices"]["Row"];
export type PriceHistoryEntry = Tables["price_history"]["Row"];
export type AgentRun = Tables["agent_runs"]["Row"];
export type AgentAction = Tables["agent_actions"]["Row"];
export type ReviewQueueItem = Tables["review_queue"]["Row"];
export type DataConflict = Tables["data_conflicts"]["Row"];
export type AutomationSettings = Tables["automation_settings"]["Row"];
export type Comparison = Tables["comparisons"]["Row"];
export type Wishlist = Tables["wishlists"]["Row"];

export interface ProductWithDetails extends Product {
  brand: Brand;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
}
