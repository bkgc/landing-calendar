import type { LandingAnimation } from "@/types/blocks";

export function landingAnimationClass(animation: LandingAnimation = "none") {
  return animation === "none"
    ? ""
    : `landing-animate landing-animate-${animation}`;
}
