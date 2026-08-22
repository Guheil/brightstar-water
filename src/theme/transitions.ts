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


export const dialogMotion = {
  enterOffset: 34,
  enterScale: 0.95,
  enterRotate: -0.7,
  enterDuration: 440,
  enterEase: 'power3.out',
  iconEnterScale: 0.8,
  iconEnterRotate: -8,
  iconEnterDuration: 320,
  iconEase: 'back.out(1.35)',
  titleEnterDuration: 220,
  bodyEnterDuration: 260,
  actionsEnterDuration: 240,
  contentEase: 'power2.out',
  contentOffset: 16,
  actionsOffset: 12,
  iconDelay: 0.08,
  titleDelay: 0.09,
  bodyDelay: 0.14,
  actionsDelay: 0.2,
  exitOffset: 12,
  exitScale: 0.985,
  exitRotate: 0.25,
  exitDuration: 260,
  exitEase: 'power2.inOut',
  contentExitDuration: 130,
  exitContentOffset: 8,
  iconExitScale: 0.94,
  iconExitRotate: 3,
  iconExitDuration: 150,
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
