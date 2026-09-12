"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/overlays/dialog";
import { Button } from "@/components/ui/button";
import { addToWishlistAction, removeFromWishlistAction } from "@/lib/actions/wishlist";

export function WishlistButton({
  productId,
  initialSaved,
  isAuthenticated,
  size = "sm",
}: {
  productId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
  size?: "sm" | "md";
}) {
  const [saved, setSaved] = React.useState(initialSaved);
  const [pending, setPending] = React.useState(false);
  const [promptOpen, setPromptOpen] = React.useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setPromptOpen(true);
      return;
    }

    const next = !saved;
    setSaved(next); // optimistic
    setPending(true);
    const result = next ? await addToWishlistAction(productId) : await removeFromWishlistAction(productId);
    setPending(false);
    if (result.error) setSaved(!next); // revert on failure
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-caption transition-colors ${
          saved ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} aria-hidden="true" />
        {saved ? "Saved" : "Save"}
      </button>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to save smartphones</DialogTitle>
          </DialogHeader>
          <p className="text-small text-muted-foreground">Create a free account to save smartphones to your wishlist.</p>
          <div className="flex gap-2 pt-2">
            <Button asChild size={size}>
              <a href="/auth/login">Sign In</a>
            </Button>
            <Button asChild size={size} variant="outline">
              <a href="/auth/signup">Create Account</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
