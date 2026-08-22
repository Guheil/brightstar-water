import type { TransitionProps } from '@mui/material/transitions';
import type { ReactElement } from 'react';

export interface DialogMotionTransitionProps extends TransitionProps {
  children: ReactElement;
  ownerState?: unknown;
}
