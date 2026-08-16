'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { STOREFRONT_MEDIA } from '@/config';
import type { GuestAccountBenefit, GuestAccountJourneyStep } from './interface';
import {
  BenefitDescription,
  BenefitItem,
  BenefitList,
  BenefitsContainer,
  BenefitsSection,
  BenefitTitle,
  ClosingContainer,
  ClosingCopy,
  ClosingSection,
  ClosingText,
  ClosingTitle,
  ConnectedContainer,
  ConnectedCopy,
  ConnectedMedia,
  ConnectedSection,
  Hero,
  HeroContainer,
  HeroCopy,
  HeroText,
  HeroTitle,
  JourneyContainer,
  JourneyIntro,
  JourneyItem,
  JourneyList,
  JourneySection,
  JourneyStepText,
  JourneyStepTitle,
  JourneyText,
  JourneyTitle,
  MainMedia,
  MediaStage,
  Root,
  SecondaryMedia,
  SectionIntro,
  SectionText,
  SectionTitle,
  ServiceImage,
  StorefrontDescription,
  StorefrontList,
  StorefrontName,
  StorefrontRow,
} from './elements';

const BENEFITS: readonly GuestAccountBenefit[] = [
  {
    title: 'Orders',
    description:
      'Review active deliveries and previous MRJE Gas and Bright Star Water orders from one account.',
  },
  {
    title: 'Delivery locations',
    description:
      'Save the places where you regularly receive deliveries so future checkout is quicker.',
  },
  {
    title: 'Loyalty activity',
    description:
      'Keep eligible rewards activity connected to the same customer account across both storefronts.',
  },
  {
    title: 'Delivery status',
    description:
      'Follow an order from confirmation through assignment and final delivery without losing its history.',
  },
];

const JOURNEY: readonly GuestAccountJourneyStep[] = [
  {
    title: 'Choose a storefront',
    description: 'Start with MRJE Gas or Bright Star Water and browse the products you need.',
  },
  {
    title: 'Confirm delivery',
    description: 'Pin the delivery location, review the service fee, and select an available schedule.',
  },
  {
    title: 'Choose payment',
    description: 'Continue with Cash on Delivery or GCash and review the final amount before placing the order.',
  },
  {
    title: 'Track the order',
    description: 'Return to your account to follow fulfillment, delivery, and completed order history.',
  },
];

export default function GuestAccountScreen() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power2.out' } })
          .from('[data-guest-account-copy]', { opacity: 0, y: 18, duration: 0.55 })
          .from('[data-guest-account-media]', { opacity: 0, x: 24, duration: 0.65 }, 0.08);
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <Root ref={rootRef}>
      <Hero aria-labelledby="guest-account-title">
        <HeroContainer>
          <HeroCopy data-guest-account-copy>
            <HeroTitle id="guest-account-title">
              Your deliveries, orders and rewards in one place.
            </HeroTitle>
            <HeroText>
              Customer accounts keep MRJE Gas and Bright Star Water orders, saved delivery locations,
              and delivery activity organized in one place.
            </HeroText>
          </HeroCopy>

          <MediaStage data-guest-account-media aria-hidden="true">
            <MainMedia>
              <ServiceImage
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 100vw, 52vw"
                src={STOREFRONT_MEDIA.water.delivery.src}
              />
            </MainMedia>
            <SecondaryMedia>
              <ServiceImage
                alt=""
                fill
                sizes="(max-width: 600px) 46vw, 24vw"
                src={STOREFRONT_MEDIA.gas.delivery.src}
              />
            </SecondaryMedia>
          </MediaStage>
        </HeroContainer>
      </Hero>

      <BenefitsSection aria-labelledby="guest-account-benefits-title">
        <BenefitsContainer>
          <SectionIntro>
            <SectionTitle id="guest-account-benefits-title">
              What your account keeps together.
            </SectionTitle>
            <SectionText>
              The two storefronts stay visually separate while the practical information you need after ordering stays connected.
            </SectionText>
          </SectionIntro>

          <BenefitList>
            {BENEFITS.map((benefit) => (
              <BenefitItem key={benefit.title}>
                <BenefitTitle>{benefit.title}</BenefitTitle>
                <BenefitDescription>{benefit.description}</BenefitDescription>
              </BenefitItem>
            ))}
          </BenefitList>
        </BenefitsContainer>
      </BenefitsSection>

      <JourneySection aria-labelledby="guest-account-journey-title">
        <JourneyContainer>
          <JourneyIntro>
            <JourneyTitle id="guest-account-journey-title">
              From storefront to doorstep.
            </JourneyTitle>
            <JourneyText>
              Your account connects the decisions made during ordering with the delivery details and history you need afterward.
            </JourneyText>
          </JourneyIntro>
          <JourneyList>
            {JOURNEY.map((step) => (
              <JourneyItem key={step.title}>
                <JourneyStepTitle>{step.title}</JourneyStepTitle>
                <JourneyStepText>{step.description}</JourneyStepText>
              </JourneyItem>
            ))}
          </JourneyList>
        </JourneyContainer>
      </JourneySection>

      <ConnectedSection aria-labelledby="guest-account-connected-title">
        <ConnectedContainer>
          <ConnectedCopy>
            <SectionTitle id="guest-account-connected-title">
              One customer account, two distinct storefronts.
            </SectionTitle>
            <SectionText>
              You can shop each service independently while keeping delivery locations, order history, and account details connected behind the scenes.
            </SectionText>
            <StorefrontList>
              <StorefrontRow>
                <StorefrontName>MRJE Gas</StorefrontName>
                <StorefrontDescription>
                  LPG refills and gas accessories remain in their own storefront and ordering experience.
                </StorefrontDescription>
              </StorefrontRow>
              <StorefrontRow>
                <StorefrontName>Bright Star Water</StorefrontName>
                <StorefrontDescription>
                  Water refills, containers, and household water products remain easy to browse separately.
                </StorefrontDescription>
              </StorefrontRow>
              <StorefrontRow>
                <StorefrontName>Shared account</StorefrontName>
                <StorefrontDescription>
                  Your profile, delivery locations, order history, and loyalty activity stay accessible from one place.
                </StorefrontDescription>
              </StorefrontRow>
            </StorefrontList>
          </ConnectedCopy>
          <ConnectedMedia>
            <ServiceImage
              alt="Water delivery rider transporting large water bottles through a neighborhood"
              fill
              sizes="(max-width: 900px) 100vw, 42vw"
              src={STOREFRONT_MEDIA.water.delivery.src}
            />
          </ConnectedMedia>
        </ConnectedContainer>
      </ConnectedSection>

      <ClosingSection aria-labelledby="guest-account-closing-title">
        <ClosingContainer>
          <ClosingCopy>
            <ClosingTitle id="guest-account-closing-title">
              Ready to keep your deliveries together?
            </ClosingTitle>
            <ClosingText>
              Customer access keeps ordering, saved delivery details, and delivery history connected across both storefronts.
            </ClosingText>
          </ClosingCopy>
        </ClosingContainer>
      </ClosingSection>
    </Root>
  );
}
