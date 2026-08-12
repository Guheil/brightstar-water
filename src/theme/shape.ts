import type { ShapeOptions } from "@mui/material/styles";

export interface RadiusTokens {
  control: number;
  media: number;
  surface: number;
}

export const radii: RadiusTokens = {
  control: 8,
  media: 12,
  surface: 12,
};

export const shape: ShapeOptions = {
  borderRadius: radii.control,
};
