import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/primitives";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <Section className="py-16">
      <Container className="mx-auto max-w-sm">
        <h1 className="mb-6 text-h1">Create Account</h1>
        <SignupForm />
      </Container>
    </Section>
  );
}
