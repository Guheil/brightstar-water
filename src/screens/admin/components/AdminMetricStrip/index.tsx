import { Item, Label, Root, Value } from './elements';
import type { AdminMetricStripProps } from './interface';

export default function AdminMetricStrip({ ariaLabel, items }: AdminMetricStripProps) {
  return (
    <Root aria-label={ariaLabel}>
      {items.map((item) => (
        <Item data-tone={item.tone ?? 'neutral'} key={item.label}>
          <Label>{item.label}</Label>
          <Value>{item.value}</Value>
        </Item>
      ))}
    </Root>
  );
}
