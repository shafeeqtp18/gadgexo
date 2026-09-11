import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/primitives";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <Section className="py-16">
      <Container className="mx-auto max-w-sm">
        <h1 className="mb-6 text-h1">Set New Password</h1>
        <ResetPasswordForm />
      </Container>
    </Section>
  );
}
