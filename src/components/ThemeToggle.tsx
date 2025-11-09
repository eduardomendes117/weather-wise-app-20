import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-full hover:bg-muted transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-foreground transition-transform duration-300 rotate-0" />
      ) : (
        <Sun className="h-5 w-5 text-foreground transition-transform duration-300 rotate-90" />
      )}
    </Button>
  );
};
