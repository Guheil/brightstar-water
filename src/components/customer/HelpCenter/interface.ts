import type { BrandKey } from '@/config/brands';
import type { FaqCategoryId, FaqItem } from '@/types/faq';

export type HelpCenterTone = 'neutral' | 'gas' | 'water';

export interface HelpCenterProps {
  brandKey?: BrandKey | null;
}

export interface HelpCategoryButtonProps {
  $active: boolean;
  $tone: HelpCenterTone;
}

export interface HelpFloatingButtonProps {
  $tone: HelpCenterTone;
}

export interface HelpCategoryOption {
  id: 'all' | FaqCategoryId;
  label: string;
}

export interface QuestionGroupContentProps {
  items: readonly FaqItem[];
  expandedId: string | false;
  onExpandedChange: (id: string | false) => void;
}
