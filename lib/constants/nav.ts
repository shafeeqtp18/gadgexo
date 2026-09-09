export const DESKTOP_NAV = [
  { label: "Home", href: "/" },
  { label: "Smartphones", href: "/smartphones" },
  { label: "Compare", href: "/compare" },
  { label: "Deals", href: "/deals" },
] as const;

// Kept intentionally small and extensible — Phase 4+ pages get added
// here as they're actually built, not pre-listed before they exist.
export const MOBILE_BOTTOM_NAV = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Discover", href: "/smartphones", icon: "Compass" },
  { label: "Compare", href: "/compare", icon: "GitCompare" },
  { label: "Deals", href: "/deals", icon: "Tag" },
  { label: "Profile", href: "/account", icon: "User" },
] as const;
