import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { UserWithProfile } from "@/types";

export function Navbar({ user }: { user: UserWithProfile }) {
  const displayName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email;

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
