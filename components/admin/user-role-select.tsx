"use client";

import * as React from "react";
import { updateUserRoleAction } from "@/lib/actions/admin";

const ROLES = ["user", "editor", "moderator", "admin"];

export function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = React.useState(currentRole);
  const [error, setError] = React.useState<string | null>(null);

  async function handleChange(next: string) {
    const prev = role;
    setRole(next); // optimistic
    setError(null);
    const result = await updateUserRoleAction(userId, next);
    if (result.error) {
      setRole(prev);
      setError(result.error);
    }
  }

  return (
    <div>
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-small"
      >
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  );
}
