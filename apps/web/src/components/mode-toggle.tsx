import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme("light")}
        className="hidden dark:flex dark:items-center dark:justify-center"
      >
        <Sun />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme("dark")}
        className="flex dark:hidden items-center justify-center"
      >
        <Moon />
      </Button>
    </>
  );
}
