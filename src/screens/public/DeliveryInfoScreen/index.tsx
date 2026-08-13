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
      'The order total remains due until delivery is completed. Prepare the displayed amount for collection.',
  },
  {
    title: 'GCash',
    description:
      'Select GCash at checkout to create an order awaiting payment verification.',
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
            Review service areas and delivery fees for households around San
            Pedro, Laguna before placing an order.
          </HeroText>
        </HeroContainer>
      </Hero>

      <Section aria-labelledby="zones-title">
        <Container>
          <SectionHeader>
            <SectionTitle id="zones-title">Delivery zones and fees</SectionTitle>
            <SectionIntro>
              Boundary values are inclusive at 3, 6, and 10 km. Checkout blocks
              an address when its delivery distance exceeds 10 km.
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
              <StepTitle>Choose a delivery address</StepTitle>
              <StepText>
                Select one of your saved addresses for the delivery quote.
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
                Choose an available delivery date and time window at checkout.
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
              Choose cash on delivery or GCash when reviewing your order.
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
              Ready to browse? Product pages show current availability, while
              the final delivery fee appears after an address is chosen.
            </CalloutText>
            <ShopLink href="/shop">Shop products</ShopLink>
          </Callout>
        </Container>
      </AlternateSection>
    </Root>
  );
}
