import {
  BrandName,
  BrandSection,
  ContactLine,
  ContactList,
  FooterBottom,
  FooterContainer,
  FooterGrid,
  FooterLink,
  FooterRoot,
  GroupNavigation,
  GroupTitle,
  LegalText,
  LinkGroup,
  Summary,
} from './elements';
import type { CustomerFooterProps } from './interface';

export default function CustomerFooter({
  brandName,
  className,
  contactLines = [],
  groups = [],
  legalText,
  summary,
}: CustomerFooterProps) {
  return (
    <FooterRoot className={className}>
      <FooterContainer>
        <FooterGrid>
          <BrandSection>
            <BrandName>{brandName}</BrandName>
            <Summary>{summary}</Summary>
            {contactLines.length ? (
              <ContactList>
                {contactLines.map((line) => (
                  <ContactLine key={line}>{line}</ContactLine>
                ))}
              </ContactList>
            ) : null}
          </BrandSection>

          {groups.map((group) => (
            <LinkGroup key={group.title}>
              <GroupTitle>{group.title}</GroupTitle>
              <GroupNavigation aria-label={`${group.title} links`}>
                {group.links.map((link) => (
                  <FooterLink href={link.href} key={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </GroupNavigation>
            </LinkGroup>
          ))}
        </FooterGrid>

        <FooterBottom>
          <LegalText>{legalText}</LegalText>
        </FooterBottom>
      </FooterContainer>
    </FooterRoot>
  );
}
