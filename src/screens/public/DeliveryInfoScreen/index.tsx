'use client';

import type { DeliveryZoneView, PaymentOptionView } from './interface';
import {
  AlternateSection,
  Callout,
  CalloutText,
  Container,
  Explanation,
  Hero,
  HeroContainer,
  HeroText,
  HeroTitle,
  PaymentGrid,
  PaymentItem,
  PaymentText,
  PaymentTitle,
  Root,
  Section,
  SectionHeader,
  SectionIntro,
  SectionTitle,
  ShopLink,
  Step,
  StepText,
  StepTitle,
  ZoneBoundary,
  ZoneFee,
  ZoneList,
  ZoneRow,
  ZoneTitle,
} from './elements';

const zones: DeliveryZoneView[] = [
  { title: 'Zone 1', boundary: '0 to 3 km', fee: 'Free delivery' },
  { title: 'Zone 2', boundary: 'Over 3 km to 6 km', fee: '₱30' },
  { title: 'Zone 3', boundary: 'Over 6 km to 10 km', fee: '₱50' },
  { title: 'Outside coverage', boundary: 'Over 10 km', fee: 'Unavailable' },
];

const paymentOptions: PaymentOptionView[] = [
  {
    title: 'Cash on delivery',
    description:
      'The order total remains due until the deliverer records the fictional delivery outcome. Prepare the displayed amount for collection.',
  },
  {
    title: 'GCash demo',
    description:
      'Checkout can demonstrate a non-scannable QR and Admin verification state. No real account number, payment credential, or transfer is used.',
  },
];

export default function DeliveryInfoScreen() {
  return (
    <Root>
      <Hero aria-labelledby="delivery-title">
        <HeroContainer>
          <HeroTitle id="delivery-title">
            Delivery coverage you can review before checkout.
          </HeroTitle>
          <HeroText>
            The prototype uses fictional address zones around San Pedro,
            Laguna. It does not calculate live GPS distance or promise real
            delivery availability.
          </HeroText>
        </HeroContainer>
      </Hero>

      <Section aria-labelledby="zones-title">
        <Container>
          <SectionHeader>
            <SectionTitle id="zones-title">Delivery zones and fees</SectionTitle>
            <SectionIntro>
              Boundary values are inclusive at 3, 6, and 10 km. Checkout blocks
              a demo address once its fixture distance exceeds 10 km.
            </SectionIntro>
          </SectionHeader>
          <ZoneList>
            {zones.map((zone) => (
              <ZoneRow key={zone.title}>
                <ZoneTitle>{zone.title}</ZoneTitle>
                <ZoneBoundary>{zone.boundary}</ZoneBoundary>
                <ZoneFee>{zone.fee}</ZoneFee>
              </ZoneRow>
            ))}
          </ZoneList>
          <Explanation>
            <Step>
              <StepTitle>Choose a demo address</StepTitle>
              <StepText>
                Saved fictional addresses include a predefined distance band.
              </StepText>
            </Step>
            <Step>
              <StepTitle>Review the quoted fee</StepTitle>
              <StepText>
                The delivery charge is shown before the order is submitted.
              </StepText>
            </Step>
            <Step>
              <StepTitle>Select a schedule</StepTitle>
              <StepText>
                Choose one of the prototype date and time fixtures at checkout.
              </StepText>
            </Step>
          </Explanation>
        </Container>
      </Section>

      <AlternateSection aria-labelledby="payment-title">
        <Container>
          <SectionHeader>
            <SectionTitle id="payment-title">Payment options</SectionTitle>
            <SectionIntro>
              Both methods are presentation-only until a secure backend and
              production payment process are approved.
            </SectionIntro>
          </SectionHeader>
          <PaymentGrid>
            {paymentOptions.map((option) => (
              <PaymentItem key={option.title}>
                <PaymentTitle>{option.title}</PaymentTitle>
                <PaymentText>{option.description}</PaymentText>
              </PaymentItem>
            ))}
          </PaymentGrid>
          <Callout>
            <CalloutText>
              Ready to browse? Product pages show current fictional stock, but
              a final delivery fee appears only after a demo address is chosen.
            </CalloutText>
            <ShopLink href="/shop">Shop products</ShopLink>
          </Callout>
        </Container>
      </AlternateSection>
    </Root>
  );
}
