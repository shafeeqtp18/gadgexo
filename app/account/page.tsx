import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Heart, Settings } from "lucide-react";
import { getCurrentUser, getProfile } from "@/lib/db/account";
import { Container, Section } from "@/components/layout/primitives";
import { SignOutButton } from "@/components/account/sign-out-button";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/account");

  const profile = await getProfile(user.id);

  return (
    <Section className="py-10">
      <Container className="mx-auto max-w-lg">
        <h1 className="mb-1 text-h1">Welcome back{profile?.name ? `, ${profile.name}` : ""}</h1>
        <p className="mb-8 text-small text-muted-foreground">{profile?.email ?? user.email}</p>

        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          <Link href="/account/profile" className="flex items-center gap-3 p-4 hover:bg-surface-elevated">
            <User className="h-4 w-4" aria-hidden="true" /> Profile
          </Link>
          <Link href="/account/wishlist" className="flex items-center gap-3 p-4 hover:bg-surface-elevated">
            <Heart className="h-4 w-4" aria-hidden="true" /> Wishlist
          </Link>
          <div className="flex items-center gap-3 p-4 text-muted-foreground">
            <Settings className="h-4 w-4" aria-hidden="true" /> Settings — coming soon
          </div>
        </div>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </Container>
    </Section>
  );
}
