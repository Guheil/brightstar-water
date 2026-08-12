export interface CustomerFooterLink {
  href: string;
  label: string;
}

export interface CustomerFooterGroup {
  links: readonly CustomerFooterLink[];
  title: string;
}

export interface CustomerFooterProps {
  brandName: string;
  className?: string;
  contactLines?: readonly string[];
  groups?: readonly CustomerFooterGroup[];
  legalText: string;
  summary: string;
}
