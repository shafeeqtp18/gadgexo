import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/primitives";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default function ForgotPasswordPage() {
  return (
    <Section className="py-16">
      <Container className="mx-auto max-w-sm">
        <h1 className="mb-2 text-h1">Reset Password</h1>
        <p className="mb-6 text-small text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
        <ForgotPasswordForm />
      </Container>
    </Section>
  );
}
