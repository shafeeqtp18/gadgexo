/**
 * Hand-authored to match supabase/migrations/*.sql. Replace with real
 * generated types once applied to a live project:
 *
 *   supabase gen types typescript --project-id <ref> --schema public
 *
 * (No terminal needed on your side — this can run from GitHub Actions,
 * or just keep using this file until someone with CLI access runs it.)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "user" | "editor" | "moderator" | "admin";
export type ProductStatus = "draft" | "review" | "published" | "archived" | "rejected";
export type VariantAvailability = "in_stock" | "out_of_stock" | "coming_soon" | "discontinued";
export type PriceAvailability = VariantAvailability;
export type SpecificationDataType = "text" | "number" | "boolean" | "json";
export type ProductImageType = "primary" | "gallery" | "thumbnail" | "official" | "color_variant";
export type VerificationStatus = "unverified" | "partially_verified" | "verified" | "conflicting" | "needs_review";
export type SourceType = "manufacturer" | "retailer" | "official_documentation" | "trusted_publication" | "database" | "other";
export type AgentRunStatus = "running" | "completed" | "failed" | "cancelled";
export type AgentActionStatus = "pending" | "approved" | "rejected" | "auto_applied";
export type ReviewStatus = "pending" | "in_review" | "approved" | "rejected";
export type AutomationMode = "approval" | "smart_auto" | "full_auto";

/** Pick<Row, Required> for the columns a client MUST supply; everything else (defaults, generated, nullable) is optional. */
type Insertable<Row, Required extends keyof Row> = Pick<Row, Required> & Partial<Omit<Row, Required>>;

export interface ProfileRow {
  id: string; name: string | null; email: string; avatar_url: string | null;
  role: UserRole; created_at: string; updated_at: string;
}
export interface BrandRow {
  id: string; name: string; slug: string; logo_url: string | null; website_url: string | null;
  description: string | null; country: string | null; is_active: boolean; created_at: string; updated_at: string;
}
export interface CategoryRow {
  id: string; name: string; slug: string; parent_id: string | null; description: string | null;
  is_active: boolean; created_at: string; updated_at: string;
}
export interface SourceRow {
  id: string; name: string; domain: string | null; source_type: SourceType;
  reliability_priority: number; is_active: boolean; created_at: string; updated_at: string;
}
export interface SourceObservationRow {
  id: string; source_id: string; entity_type: string; entity_id: string | null; source_url: string | null;
  raw_data: Json; agent_run_id: string | null; retrieved_at: string; created_at: string;
}
export interface ProductRow {
  id: string; brand_id: string; category_id: string; name: string; slug: string;
  model_identifier: string | null; short_description: string | null; description: string | null;
  status: ProductStatus; is_featured: boolean; is_trending: boolean;
  verification_status: VerificationStatus; confidence_score: number | null;
  announcement_date: string | null; release_date: string | null; india_release_date: string | null;
  discovered_at: string | null; verified_at: string | null; created_at: string; updated_at: string;
}
export interface ProductVariantRow {
  id: string; product_id: string; ram: string | null; storage: string | null; storage_type: string | null;
  color: string | null; color_hex: string | null; region: string | null; model_number: string | null;
  sku: string | null; availability: VariantAvailability; created_at: string; updated_at: string;
}
export interface SpecificationGroupRow {
  id: string; name: string; slug: string; sort_order: number; created_at: string; updated_at: string;
}
export interface SpecificationRow {
  id: string; group_id: string; name: string; slug: string; unit: string | null;
  data_type: SpecificationDataType; sort_order: number; created_at: string; updated_at: string;
}
export interface ProductSpecificationRow {
  id: string; product_id: string; specification_id: string; value: string;
  numeric_value: number | null; boolean_value: boolean | null; source_id: string | null;
  verification_status: VerificationStatus; confidence_score: number | null; verified_at: string | null;
  created_at: string; updated_at: string;
}
export interface ProductImageRow {
  id: string; product_id: string; variant_id: string | null; image_url: string; source_id: string | null;
  alt_text: string | null; image_type: ProductImageType; sort_order: number; is_primary: boolean; created_at: string;
}
export interface RetailerRow {
  id: string; name: string; slug: string; domain: string | null; country: string | null;
  logo_url: string | null; website_url: string | null; affiliate_metadata: Json | null;
  is_active: boolean; created_at: string; updated_at: string;
}
export interface PriceRow {
  id: string; variant_id: string; retailer_id: string; price: number; mrp: number | null;
  previous_price: number | null; discount_percent: number | null; currency: string; product_url: string;
  availability: PriceAvailability; source_id: string | null; verification_status: VerificationStatus;
  confidence_score: number | null; observed_at: string; last_checked_at: string; created_at: string; updated_at: string;
}
export interface PriceHistoryRow {
  id: string; variant_id: string; retailer_id: string; price: number; mrp: number | null;
  source_id: string | null; recorded_at: string;
}
export interface AgentRunRow {
  id: string; agent_name: string; run_type: string; status: AgentRunStatus; triggered_by: string | null;
  started_at: string; completed_at: string | null; summary: Json | null; created_at: string;
}
export interface AgentActionRow {
  id: string; agent_run_id: string; action_type: string; entity_type: string; entity_id: string | null;
  previous_data: Json | null; proposed_data: Json; confidence_score: number | null; status: AgentActionStatus;
  reviewed_by: string | null; reviewed_at: string | null; created_at: string;
}
export interface ReviewQueueRow {
  id: string; agent_action_id: string | null; entity_type: string; entity_id: string | null; reason: string;
  priority: number; status: ReviewStatus; assigned_to: string | null; created_at: string;
  resolved_at: string | null; resolved_by: string | null;
}
export interface DataConflictRow {
  id: string; entity_type: string; entity_id: string; field_name: string; conflicting_values: Json;
  status: "open" | "resolved" | "ignored"; resolved_by: string | null; resolved_at: string | null; created_at: string;
}
export interface AutomationSettingsRow {
  id: string; category_id: string | null; enabled: boolean; automation_mode: AutomationMode;
  confidence_threshold: number; config: Json; updated_by: string | null; updated_at: string;
}
export interface ComparisonRow {
  id: string; user_id: string | null; share_token: string; created_at: string; updated_at: string;
}
export interface ComparisonItemRow {
  id: string; comparison_id: string; product_id: string; position: number; created_at: string;
}
export interface WishlistRow { id: string; user_id: string; created_at: string; }
export interface WishlistItemRow { id: string; wishlist_id: string; product_id: string; created_at: string; }
export interface AdminLogRow {
  id: string; user_id: string | null; action: string; entity_type: string; entity_id: string | null;
  old_data: Json | null; new_data: Json | null; created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles:               { Row: ProfileRow; Insert: Insertable<ProfileRow, "id" | "email">; Update: Partial<ProfileRow> };
      brands:                 { Row: BrandRow; Insert: Insertable<BrandRow, "name" | "slug">; Update: Partial<BrandRow> };
      categories:              { Row: CategoryRow; Insert: Insertable<CategoryRow, "name" | "slug">; Update: Partial<CategoryRow> };
      sources:                 { Row: SourceRow; Insert: Insertable<SourceRow, "name">; Update: Partial<SourceRow> };
      source_observations:     { Row: SourceObservationRow; Insert: Insertable<SourceObservationRow, "source_id" | "entity_type" | "raw_data">; Update: Partial<SourceObservationRow> };
      products:                 { Row: ProductRow; Insert: Insertable<ProductRow, "brand_id" | "category_id" | "name" | "slug">; Update: Partial<ProductRow> };
      product_variants:         { Row: ProductVariantRow; Insert: Insertable<ProductVariantRow, "product_id">; Update: Partial<ProductVariantRow> };
      specification_groups:     { Row: SpecificationGroupRow; Insert: Insertable<SpecificationGroupRow, "name" | "slug">; Update: Partial<SpecificationGroupRow> };
      specifications:           { Row: SpecificationRow; Insert: Insertable<SpecificationRow, "group_id" | "name" | "slug">; Update: Partial<SpecificationRow> };
      product_specifications:   { Row: ProductSpecificationRow; Insert: Insertable<ProductSpecificationRow, "product_id" | "specification_id" | "value">; Update: Partial<ProductSpecificationRow> };
      product_images:           { Row: ProductImageRow; Insert: Insertable<ProductImageRow, "product_id" | "image_url">; Update: Partial<ProductImageRow> };
      retailers:                 { Row: RetailerRow; Insert: Insertable<RetailerRow, "name" | "slug">; Update: Partial<RetailerRow> };
      prices:                   { Row: PriceRow; Insert: Insertable<PriceRow, "variant_id" | "retailer_id" | "price" | "product_url">; Update: Partial<PriceRow> };
      price_history:             { Row: PriceHistoryRow; Insert: Insertable<PriceHistoryRow, "variant_id" | "retailer_id" | "price">; Update: never };
      agent_runs:                 { Row: AgentRunRow; Insert: Insertable<AgentRunRow, "agent_name" | "run_type">; Update: Partial<AgentRunRow> };
      agent_actions:               { Row: AgentActionRow; Insert: Insertable<AgentActionRow, "agent_run_id" | "action_type" | "entity_type" | "proposed_data">; Update: Partial<AgentActionRow> };
      review_queue:                 { Row: ReviewQueueRow; Insert: Insertable<ReviewQueueRow, "entity_type" | "reason">; Update: Partial<ReviewQueueRow> };
      data_conflicts:               { Row: DataConflictRow; Insert: Insertable<DataConflictRow, "entity_type" | "entity_id" | "field_name" | "conflicting_values">; Update: Partial<DataConflictRow> };
      automation_settings:           { Row: AutomationSettingsRow; Insert: Insertable<AutomationSettingsRow, never>; Update: Partial<AutomationSettingsRow> };
      comparisons:                   { Row: ComparisonRow; Insert: Insertable<ComparisonRow, never>; Update: Partial<ComparisonRow> };
      comparison_items:               { Row: ComparisonItemRow; Insert: Insertable<ComparisonItemRow, "comparison_id" | "product_id" | "position">; Update: never };
      wishlists:                       { Row: WishlistRow; Insert: Insertable<WishlistRow, "user_id">; Update: never };
      wishlist_items:                   { Row: WishlistItemRow; Insert: Insertable<WishlistItemRow, "wishlist_id" | "product_id">; Update: never };
      admin_logs:                       { Row: AdminLogRow; Insert: Insertable<AdminLogRow, "action" | "entity_type">; Update: never };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole; product_status: ProductStatus; variant_availability: VariantAvailability;
      price_availability: PriceAvailability; specification_data_type: SpecificationDataType;
      product_image_type: ProductImageType; verification_status: VerificationStatus; source_type: SourceType;
      agent_run_status: AgentRunStatus; agent_action_status: AgentActionStatus; review_status: ReviewStatus;
      automation_mode: AutomationMode;
    };
  };
}
