// components/DarkModeSwitch.tsx
import { Switch } from "@/components/ui/switch";
import { useTheme } from "./theme-provider";

export function DarkModeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
      <span className="text-sm text-muted-foreground">Dark Mode</span>
    </div>
  );
}
