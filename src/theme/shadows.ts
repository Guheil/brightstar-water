import { alpha } from "@mui/material/styles";
import type { Shadows } from "@mui/material/styles";

import { paletteColors } from "./palette";

const surfaceShadow = `0 1px 2px ${alpha(paletteColors.deepInk, 0.08)}`;
const floatingShadow = `0 6px 18px ${alpha(paletteColors.deepInk, 0.12)}`;
const overlayShadow = `0 14px 36px ${alpha(paletteColors.deepInk, 0.16)}`;

/**
 * MUI requires 25 elevation entries. They intentionally collapse into three
 * restrained levels so elevation never becomes the primary visual structure.
 */
export const shadows = Array.from({ length: 25 }, (_, elevation) => {
  if (elevation === 0) {
    return "none";
  }

  if (elevation <= 2) {
    return surfaceShadow;
  }

  if (elevation <= 8) {
    return floatingShadow;
  }

  return overlayShadow;
}) as Shadows;
