'use client';

import { Minus, Plus } from 'lucide-react';
import { ControlButton, Root, Value } from './elements';
import type { QuantityControlProps } from './interface';

export default function QuantityControl({
  className,
  disabled = false,
  label = 'Quantity',
  max = Number.POSITIVE_INFINITY,
  min = 1,
  onChange,
  value,
}: QuantityControlProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <Root aria-label={`${label}: ${value}`} className={className} role="group">
      <ControlButton
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={!canDecrease}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus aria-hidden="true" />
      </ControlButton>
      <Value aria-live="polite">
        {value}
      </Value>
      <ControlButton
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={!canIncrease}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus aria-hidden="true" />
      </ControlButton>
    </Root>
  );
}
