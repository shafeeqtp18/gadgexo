import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/db/account";
import { Container, Section } from "@/components/layout/primitives";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/account/profile");

  const profile = await getProfile(user.id);

  return (
    <Section className="py-10">
      <Container className="mx-auto max-w-lg">
        <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Profile" }]} className="mb-6" />
        <h1 className="mb-6 text-h1">Profile</h1>
        <ProfileForm initialName={profile?.name ?? ""} email={profile?.email ?? user.email ?? ""} />
      </Container>
    </Section>
  );
}
