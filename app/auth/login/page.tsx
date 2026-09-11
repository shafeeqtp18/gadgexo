import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Section } from "@/components/layout/primitives";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <Section className="py-16">
      <Container className="mx-auto max-w-sm">
        <h1 className="mb-6 text-h1">Sign In</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Container>
    </Section>
  );
}
