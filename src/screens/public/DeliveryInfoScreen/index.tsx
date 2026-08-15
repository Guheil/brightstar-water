'use client';

import { STOREFRONT_MEDIA } from '@/config';
import type {
  DeliveryInfoScreenProps,
  DeliveryZoneView,
  PaymentOptionView,
} from './interface';
import {
  AssuranceGrid,
  AssuranceItem,
  AssuranceText,
  AssuranceTitle,
  Container,
  CoverageNote,
  CoverageNoteStrong,
  CoverageSection,
  CtaActions,
  CtaCopy,
  CtaPrimary,
  CtaSecondary,
  CtaSection,
  CtaTitle,
  Hero,
  HeroContainer,
  HeroCopy,
  HeroFact,
  HeroFactLabel,
  HeroFactValue,
  HeroFacts,
  HeroImage,
  HeroMedia,
  HeroMediaPrimary,
  HeroMediaSecondary,
  HeroText,
  HeroTitle,
  JourneyCopy,
  JourneyImage,
  JourneyMedia,
  JourneySection,
  JourneyStep,
  JourneyStepCopy,
  JourneyStepTitle,
  JourneySteps,
  JourneyText,
  JourneyTitle,
  PaymentGrid,
  PaymentItem,
  PaymentNote,
  PaymentSection,
  PaymentText,
  PaymentTitle,
  Root,
  SectionHeader,
  SectionIntro,
  SectionTitle,
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
      'Review the final amount before confirming. Payment remains due until the delivery is completed.',
  },
  {
    title: 'GCash',
    description:
      'Choose GCash at checkout to demonstrate the awaiting-verification flow without requesting real GCash credentials.',
  },
];

export default function DeliveryInfoScreen({
  shopHref = '/shop',
  storefrontName = 'MRJE Gas and Bright Star Water',
}: DeliveryInfoScreenProps = {}) {
  const isMrje = storefrontName === 'MRJE Gas';
  const isBrightStar = storefrontName === 'Bright Star Water';
  const isPlatform = !isMrje && !isBrightStar;
  const primaryHeroImage = isBrightStar
    ? STOREFRONT_MEDIA.water.delivery
    : STOREFRONT_MEDIA.gas.delivery;
  const secondaryHeroImage = isPlatform ? STOREFRONT_MEDIA.water.delivery : null;
  const journeyImage = isBrightStar
    ? STOREFRONT_MEDIA.water.refillStation
    : STOREFRONT_MEDIA.gas.cylinder;

  return (
    <Root>
      <Hero aria-labelledby="delivery-title">
        <HeroContainer>
          <HeroCopy>
            <HeroTitle id="delivery-title">
              Know the delivery fee before you confirm the order.
            </HeroTitle>
            <HeroText>
              {isPlatform
                ? 'MRJE Gas and Bright Star Water use the same local delivery coverage. Choose an address, review the quoted zone and fee, then select an available schedule at checkout.'
                : `${storefrontName} orders use the shared local delivery coverage around San Pedro, Laguna. The delivery fee is shown after an address is selected and before the order is submitted.`}
            </HeroText>
            <HeroFacts>
              <HeroFact>
                <HeroFactLabel>Service radius</HeroFactLabel>
                <HeroFactValue>Up to 10 km</HeroFactValue>
              </HeroFact>
              <HeroFact>
                <HeroFactLabel>Closest zone</HeroFactLabel>
                <HeroFactValue>Free delivery</HeroFactValue>
              </HeroFact>
              <HeroFact>
                <HeroFactLabel>Payment</HeroFactLabel>
                <HeroFactValue>COD or GCash</HeroFactValue>
              </HeroFact>
            </HeroFacts>
          </HeroCopy>
          <HeroMedia $split={Boolean(secondaryHeroImage)}>
            <HeroMediaPrimary>
              <HeroImage
                alt={primaryHeroImage.alt}
                fill
                priority
                sizes={isPlatform ? '(max-width: 900px) 100vw, 35vw' : '(max-width: 900px) 100vw, 52vw'}
                src={primaryHeroImage.src}
              />
            </HeroMediaPrimary>
            {secondaryHeroImage ? (
              <HeroMediaSecondary>
                <HeroImage
                  alt={secondaryHeroImage.alt}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 23vw"
                  src={secondaryHeroImage.src}
                />
              </HeroMediaSecondary>
            ) : null}
          </HeroMedia>
        </HeroContainer>
      </Hero>

      <CoverageSection aria-labelledby="zones-title">
        <Container>
          <SectionHeader>
            <SectionTitle id="zones-title">Delivery zones and fees</SectionTitle>
            <SectionIntro>
              The delivery rules use inclusive boundaries at 3, 6, and 10 km. An
              address beyond 10 km cannot continue through checkout.
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
          <CoverageNote>
            <CoverageNoteStrong>The fee is not guessed in the cart.</CoverageNoteStrong>
            It appears after the delivery address is known, so the order review
            can show product subtotal, delivery fee, and final total together.
          </CoverageNote>
        </Container>
      </CoverageSection>

      <JourneySection aria-labelledby="delivery-journey-title">
        <Container>
          <JourneyMedia>
            <JourneyImage
              alt={journeyImage.alt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              src={journeyImage.src}
            />
          </JourneyMedia>
          <JourneyCopy>
            <JourneyTitle id="delivery-journey-title">
              From saved address to scheduled delivery.
            </JourneyTitle>
            <JourneyText>
              The delivery flow keeps the important decisions visible instead of
              hiding them behind the final confirmation screen.
            </JourneyText>
            <JourneySteps>
              <JourneyStep>
                <JourneyStepTitle>Choose the delivery address</JourneyStepTitle>
                <JourneyStepCopy>
                  Select or enter the address that should receive this order.
                </JourneyStepCopy>
              </JourneyStep>
              <JourneyStep>
                <JourneyStepTitle>Review zone, fee, and total</JourneyStepTitle>
                <JourneyStepCopy>
                  The checkout review shows how the address affects the delivery charge.
                </JourneyStepCopy>
              </JourneyStep>
              <JourneyStep>
                <JourneyStepTitle>Select an available schedule</JourneyStepTitle>
                <JourneyStepCopy>
                  Pick the delivery date and time window before the final confirmation.
                </JourneyStepCopy>
              </JourneyStep>
            </JourneySteps>
          </JourneyCopy>
        </Container>
      </JourneySection>

      <PaymentSection aria-labelledby="payment-title">
        <Container>
          <SectionHeader>
            <SectionTitle id="payment-title">Payment stays part of the review</SectionTitle>
            <SectionIntro>
              Cash on delivery is supported in the flow. GCash is simulated for this
              thesis demo, so the site does not request real GCash credentials.
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
          <PaymentNote>
            The order review keeps the delivery address, schedule, payment method,
            product subtotal, delivery fee, and final amount together before confirmation.
          </PaymentNote>
        </Container>
      </PaymentSection>

      <CoverageSection aria-labelledby="delivery-confidence-title">
        <Container>
          <SectionHeader>
            <SectionTitle id="delivery-confidence-title">
              What you can check before placing the order
            </SectionTitle>
            <SectionIntro>
              Delivery information should remove uncertainty, not create another
              step that customers have to decode.
            </SectionIntro>
          </SectionHeader>
          <AssuranceGrid>
            <AssuranceItem>
              <AssuranceTitle>Current product availability</AssuranceTitle>
              <AssuranceText>
                Product pages show availability before you reach checkout.
              </AssuranceText>
            </AssuranceItem>
            <AssuranceItem>
              <AssuranceTitle>Address-based delivery fee</AssuranceTitle>
              <AssuranceText>
                The delivery charge is tied to the selected delivery zone.
              </AssuranceText>
            </AssuranceItem>
            <AssuranceItem>
              <AssuranceTitle>Schedule and payment choice</AssuranceTitle>
              <AssuranceText>
                Both remain visible on the final review before the order is submitted.
              </AssuranceText>
            </AssuranceItem>
          </AssuranceGrid>
        </Container>
      </CoverageSection>

      <CtaSection>
        <Container>
          <CtaCopy>
            <CtaTitle>
              {isPlatform
                ? 'Choose the storefront you need today.'
                : `Ready to continue with ${storefrontName}?`}
            </CtaTitle>
            <CtaActions>
              {isPlatform ? (
                <>
                  <CtaPrimary href="/mrje/shop">Shop MRJE Gas</CtaPrimary>
                  <CtaSecondary href="/brightstar/shop">Shop Bright Star Water</CtaSecondary>
                </>
              ) : (
                <>
                  <CtaPrimary href={shopHref}>Shop products</CtaPrimary>
                  <CtaSecondary href="/">Choose another storefront</CtaSecondary>
                </>
              )}
            </CtaActions>
          </CtaCopy>
        </Container>
      </CtaSection>
    </Root>
  );
}
