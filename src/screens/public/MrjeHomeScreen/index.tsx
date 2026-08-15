'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { STOREFRONT_MEDIA } from '@/config';
import { PRODUCT_FIXTURES } from '@/mocks';
import { formatPhp } from '@/utils';
import type { MrjeProductPreview } from './interface';
import {
  ClosingFact,
  ClosingFactLabel,
  ClosingFactValue,
  ClosingFacts,
  ClosingImage,
  ClosingMedia,
  ClosingNote,
  ClosingPanel,
  ClosingPrimary,
  ClosingPrimaryArrow,
  ClosingPrimaryLabel,
  ClosingSecondary,
  ClosingSection,
  ClosingStage,
  ClosingSubRow,
  ClosingText,
  ClosingTitle,
  FeatureContainer,
  FeatureCopy,
  FeatureImage,
  FeatureItem,
  FeatureItemText,
  FeatureItemTitle,
  FeatureList,
  FeatureMedia,
  FeatureSection,
  FeatureText,
  FeatureTitle,
  FeatureLink,
  Hero,
  HeroActions,
  HeroContainer,
  HeroCopy,
  HeroImage,
  HeroMedia,
  HeroText,
  HeroTitle,
  InfoContainer,
  InfoGrid,
  InfoItem,
  InfoItemText,
  InfoItemTitle,
  InfoSection,
  InfoText,
  InfoTitle,
  LedgerList,
  LedgerRow,
  LedgerTerm,
  LedgerTitle,
  LedgerValue,
  PrimaryAction,
  ProductCopy,
  ProductDescription,
  ProductGrid,
  ProductImage,
  ProductItem,
  ProductMedia,
  ProductName,
  ProductPrice,
  ProductsContainer,
  ProductsSection,
  Root,
  SecondaryAction,
  SectionHeader,
  SectionText,
  SectionTitle,
  ServiceLedger,
  StoryContainer,
  StoryCopy,
  StoryImage,
  StoryMedia,
  StorySection,
  StoryText,
  StoryTitle,
  ViewAllLink,
} from './elements';

const products: readonly MrjeProductPreview[] = PRODUCT_FIXTURES.filter(
  (product) => product.category === 'gas',
).map((product) => ({
  id: product.id,
  imageAlt: product.imageAlt,
  imageSrc: product.imageSrc,
  name: product.name,
  shortDescription: product.shortDescription,
  price: formatPhp(product.priceCentavos),
}));

export default function MrjeHomeScreen() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power2.out' } })
          .from('[data-mrje-copy]', { opacity: 0, y: 20, duration: 0.55 })
          .from('[data-mrje-media]', { opacity: 0, x: 24, duration: 0.65 }, 0.08);

        const closingStage = rootRef.current?.querySelector('[data-gas-closing-stage]');
        if (!closingStage || typeof IntersectionObserver === 'undefined') {
          return undefined;
        }

        const closingMedia = closingStage.querySelector('[data-gas-closing-media]');
        const closingPanel = closingStage.querySelector('[data-gas-closing-panel]');
        const closingFacts = closingStage.querySelectorAll('[data-gas-closing-fact]');
        if (!closingMedia || !closingPanel) {
          return undefined;
        }

        let closingTimeline: gsap.core.Timeline | undefined;

        gsap.set(closingMedia, { opacity: 0, scale: 1.025 });
        gsap.set(closingPanel, { opacity: 0, x: -32 });
        gsap.set(closingFacts, { opacity: 0, y: 12 });

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) {
              return;
            }

            closingTimeline = gsap
              .timeline({ defaults: { ease: 'power3.out' } })
              .to(closingMedia, { opacity: 1, scale: 1, duration: 0.8 })
              .to(closingPanel, { opacity: 1, x: 0, duration: 0.65 }, 0.1)
              .to(closingFacts, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.34);

            observer.disconnect();
          },
          { threshold: 0.2 },
        );

        observer.observe(closingStage);

        return () => {
          observer.disconnect();
          closingTimeline?.kill();
        };
      });

      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <Root ref={rootRef}>
      <Hero aria-labelledby="mrje-title">
        <HeroContainer>
          <HeroCopy data-mrje-copy>
            <HeroTitle id="mrje-title">
              LPG for the kitchen, delivered with the details clear.
            </HeroTitle>
            <HeroText>
              Browse household LPG refills and compatible accessories. Review
              stock, delivery coverage, and the order total before checkout.
            </HeroText>
            <HeroActions>
              <PrimaryAction href="/mrje/shop">Shop MRJE Gas</PrimaryAction>
              <SecondaryAction href="/mrje/delivery">
                Review delivery coverage
              </SecondaryAction>
            </HeroActions>
            <ServiceLedger>
              <LedgerTitle>MRJE delivery reference</LedgerTitle>
              <LedgerList>
                <LedgerRow>
                  <LedgerTerm>0 to 3 km</LedgerTerm>
                  <LedgerValue>Free delivery</LedgerValue>
                </LedgerRow>
                <LedgerRow>
                  <LedgerTerm>Over 3 to 6 km</LedgerTerm>
                  <LedgerValue>₱30</LedgerValue>
                </LedgerRow>
                <LedgerRow>
                  <LedgerTerm>Over 6 to 10 km</LedgerTerm>
                  <LedgerValue>₱50</LedgerValue>
                </LedgerRow>
              </LedgerList>
            </ServiceLedger>
          </HeroCopy>
          <HeroMedia data-mrje-media>
            <HeroImage
              alt={STOREFRONT_MEDIA.gas.hero.alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              src={STOREFRONT_MEDIA.gas.hero.src}
            />
          </HeroMedia>
        </HeroContainer>
      </Hero>

      <ProductsSection aria-labelledby="mrje-products-title">
        <ProductsContainer>
          <SectionHeader>
            <div>
              <SectionTitle id="mrje-products-title">MRJE products</SectionTitle>
              <SectionText>
                Gas products stay inside the MRJE storefront while your cart and
                account remain shared with Bright Star Water.
              </SectionText>
            </div>
            <ViewAllLink href="/mrje/shop">View all gas products</ViewAllLink>
          </SectionHeader>
          <ProductGrid>
            {products.map((product) => (
              <ProductItem href={`/mrje/product/${product.id}`} key={product.id}>
                <ProductMedia>
                  <ProductImage
                    alt={product.imageAlt}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    src={product.imageSrc}
                  />
                </ProductMedia>
                <ProductCopy>
                  <ProductName>{product.name}</ProductName>
                  <ProductDescription>{product.shortDescription}</ProductDescription>
                  <ProductPrice>{product.price}</ProductPrice>
                </ProductCopy>
              </ProductItem>
            ))}
          </ProductGrid>
        </ProductsContainer>
      </ProductsSection>

      <StorySection aria-labelledby="mrje-story-title">
        <StoryContainer>
          <StoryMedia>
            <StoryImage
              alt={STOREFRONT_MEDIA.gas.kitchen.alt}
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
              src={STOREFRONT_MEDIA.gas.kitchen.src}
            />
          </StoryMedia>
          <StoryCopy>
            <StoryTitle id="mrje-story-title">
              Built around the everyday cooking routine.
            </StoryTitle>
            <StoryText>
              MRJE keeps LPG ordering focused on the practical things customers
              need to know: the right product, current availability, delivery
              coverage, and a clear total before the order is sent.
            </StoryText>
          </StoryCopy>
        </StoryContainer>
      </StorySection>

      <FeatureSection aria-labelledby="mrje-ordering-title">
        <FeatureContainer>
          <FeatureCopy>
            <FeatureTitle id="mrje-ordering-title">
              Ordering starts with the cylinder you actually need.
            </FeatureTitle>
            <FeatureText>
              The MRJE storefront keeps LPG products separate from water so the
              customer can compare gas options without unrelated products getting
              in the way.
            </FeatureText>
            <FeatureList>
              <FeatureItem>
                <FeatureItemTitle>Check availability first</FeatureItemTitle>
                <FeatureItemText>
                  Product pages show current availability before a quantity is added to the cart.
                </FeatureItemText>
              </FeatureItem>
              <FeatureItem>
                <FeatureItemTitle>Review product details</FeatureItemTitle>
                <FeatureItemText>
                  Size, price, description, and delivery reminders stay close to the purchase action.
                </FeatureItemText>
              </FeatureItem>
              <FeatureItem>
                <FeatureItemTitle>Keep one shared cart</FeatureItemTitle>
                <FeatureItemText>
                  MRJE items can stay in the same customer cart while the storefront itself remains clearly branded.
                </FeatureItemText>
              </FeatureItem>
            </FeatureList>
            <FeatureLink href="/mrje/shop">Browse the MRJE catalog</FeatureLink>
          </FeatureCopy>
          <FeatureMedia>
            <FeatureImage
              alt={STOREFRONT_MEDIA.gas.cylinder.alt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              src={STOREFRONT_MEDIA.gas.cylinder.src}
            />
          </FeatureMedia>
        </FeatureContainer>
      </FeatureSection>

      <FeatureSection $surface="paper" aria-labelledby="mrje-delivery-title">
        <FeatureContainer $reverse>
          <FeatureCopy>
            <FeatureTitle id="mrje-delivery-title">
              Delivery fees are visible before the final confirmation.
            </FeatureTitle>
            <FeatureText>
              The system determines the delivery zone after an address is chosen.
              Customers can then review the fee, select a schedule, and see the
              final order amount before submitting.
            </FeatureText>
            <FeatureList>
              <FeatureItem>
                <FeatureItemTitle>0 to 3 km</FeatureItemTitle>
                <FeatureItemText>Free delivery within the closest service zone.</FeatureItemText>
              </FeatureItem>
              <FeatureItem>
                <FeatureItemTitle>Over 3 to 10 km</FeatureItemTitle>
                <FeatureItemText>Tiered delivery fees are shown before order confirmation.</FeatureItemText>
              </FeatureItem>
              <FeatureItem>
                <FeatureItemTitle>Beyond 10 km</FeatureItemTitle>
                <FeatureItemText>The address is treated as outside the current service area.</FeatureItemText>
              </FeatureItem>
            </FeatureList>
            <FeatureLink href="/mrje/delivery">See MRJE delivery coverage</FeatureLink>
          </FeatureCopy>
          <FeatureMedia>
            <FeatureImage
              alt={STOREFRONT_MEDIA.gas.delivery.alt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              src={STOREFRONT_MEDIA.gas.delivery.src}
            />
          </FeatureMedia>
        </FeatureContainer>
      </FeatureSection>

      <InfoSection aria-labelledby="mrje-payment-title">
        <InfoContainer>
          <div>
            <InfoTitle id="mrje-payment-title">
              Two payment paths, one clear order review.
            </InfoTitle>
            <InfoText>
              Payment selection happens after delivery information is known, so
              customers can review the full amount rather than committing to an
              incomplete subtotal.
            </InfoText>
          </div>
          <InfoGrid>
            <InfoItem>
              <InfoItemTitle>Cash on delivery</InfoItemTitle>
              <InfoItemText>
                The displayed amount remains due until the delivery is completed.
              </InfoItemText>
            </InfoItem>
            <InfoItem>
              <InfoItemTitle>GCash payment review</InfoItemTitle>
              <InfoItemText>
                The thesis demo represents an awaiting-verification GCash state without requesting real GCash credentials.
              </InfoItemText>
            </InfoItem>
            <InfoItem>
              <InfoItemTitle>Final review</InfoItemTitle>
              <InfoItemText>
                Products, quantities, delivery fee, schedule, address, payment method, and total stay together before confirmation.
              </InfoItemText>
            </InfoItem>
          </InfoGrid>
        </InfoContainer>
      </InfoSection>

      <FeatureSection aria-labelledby="mrje-account-title">
        <FeatureContainer>
          <FeatureMedia>
            <FeatureImage
              alt={STOREFRONT_MEDIA.gas.kitchen.alt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              src={STOREFRONT_MEDIA.gas.kitchen.src}
            />
          </FeatureMedia>
          <FeatureCopy>
            <FeatureTitle id="mrje-account-title">
              Your MRJE order does not disappear after checkout.
            </FeatureTitle>
            <FeatureText>
              The shared customer account keeps active orders, past orders,
              delivery information, and loyalty activity together even when the
              customer also uses Bright Star Water.
            </FeatureText>
            <FeatureList>
              <FeatureItem>
                <FeatureItemTitle>Active orders first</FeatureItemTitle>
                <FeatureItemText>Current orders stay easier to find than completed history.</FeatureItemText>
              </FeatureItem>
              <FeatureItem>
                <FeatureItemTitle>Order detail and tracking</FeatureItemTitle>
                <FeatureItemText>Review the schedule, address, products, payment method, totals, and current order state.</FeatureItemText>
              </FeatureItem>
              <FeatureItem>
                <FeatureItemTitle>Saved delivery information</FeatureItemTitle>
                <FeatureItemText>Customer profile and delivery details remain connected to the same account.</FeatureItemText>
              </FeatureItem>
            </FeatureList>
            <FeatureLink href="/customer/orders">View my orders</FeatureLink>
          </FeatureCopy>
        </FeatureContainer>
      </FeatureSection>

      <InfoSection $light aria-labelledby="mrje-loyalty-title">
        <InfoContainer>
          <div>
            <InfoTitle id="mrje-loyalty-title">
              Repeat orders can contribute to loyalty rewards.
            </InfoTitle>
            <InfoText>
              The loyalty area shows points, peso-equivalent value, recent activity,
              and qualification progress. The final earning formula remains
              configurable while the thesis and business rules are being confirmed.
            </InfoText>
          </div>
          <InfoGrid>
            <InfoItem>
              <InfoItemTitle>See current points</InfoItemTitle>
              <InfoItemText>Customers can review the balance connected to their account.</InfoItemText>
            </InfoItem>
            <InfoItem>
              <InfoItemTitle>Understand activity</InfoItemTitle>
              <InfoItemText>Recent eligible order activity is shown instead of presenting a mystery balance.</InfoItemText>
            </InfoItem>
            <InfoItem>
              <InfoItemTitle>Rules stay configurable</InfoItemTitle>
              <InfoItemText>The frontend does not present unresolved thesis loyalty rules as permanent business policy.</InfoItemText>
            </InfoItem>
          </InfoGrid>
        </InfoContainer>
      </InfoSection>

      <ClosingSection aria-labelledby="mrje-closing-title">
        <ProductsContainer>
          <ClosingStage data-gas-closing-stage>
            <ClosingPanel data-gas-closing-panel>
              <ClosingTitle id="mrje-closing-title">
                Make the next cylinder order feel like a routine, not an errand.
              </ClosingTitle>
              <ClosingText>
                Choose the LPG product, confirm availability, select the delivery
                schedule, and review the fee and payment details before the order
                is submitted.
              </ClosingText>
              <ClosingPrimary href="/mrje/shop">
                <ClosingPrimaryLabel>Shop MRJE Gas</ClosingPrimaryLabel>
                <ClosingPrimaryArrow aria-hidden="true" data-closing-arrow>↗</ClosingPrimaryArrow>
              </ClosingPrimary>
              <ClosingSubRow>
                <ClosingSecondary href="/brightstar">Need water instead? Visit Bright Star Water</ClosingSecondary>
                <ClosingNote>Shared account access keeps both order histories together.</ClosingNote>
              </ClosingSubRow>
              <ClosingFacts>
                <ClosingFact data-gas-closing-fact>
                  <ClosingFactLabel>Catalog</ClosingFactLabel>
                  <ClosingFactValue>Dedicated LPG products and accessories</ClosingFactValue>
                </ClosingFact>
                <ClosingFact data-gas-closing-fact>
                  <ClosingFactLabel>Delivery</ClosingFactLabel>
                  <ClosingFactValue>Service coverage up to 10 km</ClosingFactValue>
                </ClosingFact>
                <ClosingFact data-gas-closing-fact>
                  <ClosingFactLabel>Checkout</ClosingFactLabel>
                  <ClosingFactValue>Availability, schedule and payment shown before confirmation</ClosingFactValue>
                </ClosingFact>
              </ClosingFacts>
            </ClosingPanel>
            <ClosingMedia data-gas-closing-media>
              <ClosingImage
                alt={STOREFRONT_MEDIA.gas.delivery.alt}
                fill
                sizes="(max-width: 900px) 100vw, 58vw"
                src={STOREFRONT_MEDIA.gas.delivery.src}
              />
            </ClosingMedia>
          </ClosingStage>
        </ProductsContainer>
      </ClosingSection>
    </Root>
  );
}
