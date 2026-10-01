import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export * from "./appointment";
export * from "./blocks";
export * from "./business";
export * from "./notification";
export * from "./service";
export * from "./staff";
