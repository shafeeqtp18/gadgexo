import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/db/account";
import { getWishlistItems } from "@/lib/db/wishlist";
import { Container, Section } from "@/components/layout/primitives";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { WishlistGrid } from "@/components/account/wishlist-grid";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/account/wishlist");

  const items = await getWishlistItems(user.id);

  return (
    <Section className="py-10">
      <Container>
        <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Wishlist" }]} className="mb-6" />
        <h1 className="mb-6 text-h1">Your Wishlist ({items.length})</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save smartphones you want to keep an eye on."
            />
            <Button asChild>
              <a href="/smartphones">Explore Smartphones</a>
            </Button>
          </div>
        ) : (
          <WishlistGrid items={items} />
        )}
      </Container>
    </Section>
  );
}
