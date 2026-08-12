import type { TransitionsOptions } from "@mui/material/styles";

export const transitionDurations = {
  shortest: 120,
  shorter: 160,
  short: 200,
  standard: 240,
  complex: 320,
  enteringScreen: 220,
  leavingScreen: 180,
} as const;

export const customerHeaderMotion = {
  menuPause: 0,
} as const;

export const transitions: TransitionsOptions = {
  easing: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
  duration: transitionDurations,
};
