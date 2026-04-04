import { ThemeToggle } from "@/components/shared/theme-toggle";
import { formatDisplayName } from "@/lib/format";
import type { UserWithProfile } from "@/types";

export function Navbar({ user }: { user: UserWithProfile }) {
  const displayName = formatDisplayName(user.profile, user.email, user.role);

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">
          Bienvenido, <span className="text-foreground">{displayName}</span>
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
