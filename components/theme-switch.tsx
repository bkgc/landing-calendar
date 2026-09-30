import { FC, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const isLight = resolvedTheme === "light";

  const handleToggle = () => {
    setTheme(isLight ? "dark" : "light");
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) return <div aria-hidden className="h-8 w-8" />;

  return (
    <Button
      isIconOnly
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className={className}
      size="sm"
      variant="light"
      onPress={handleToggle}
    >
      {isLight ? <SunFilledIcon size={22} /> : <MoonFilledIcon size={22} />}
    </Button>
  );
};
