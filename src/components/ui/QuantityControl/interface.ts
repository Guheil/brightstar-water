export interface QuantityControlProps {
  className?: string;
  disabled?: boolean;
  label?: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
}
