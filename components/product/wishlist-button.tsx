import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WishlistButton() {
  return (
    <Button variant="outline" size="sm" disabled title="Sign in to save products — coming in a future update">
      <Heart className="h-4 w-4" aria-hidden="true" />
      Save
    </Button>
  );
}
