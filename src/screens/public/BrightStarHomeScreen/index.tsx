'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { STOREFRONT_MEDIA } from '@/config';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import type { BrightStarProductPreview } from './interface';
import {
  AccountContainer,
  AccountCopy,
  AccountImage,
  AccountMedia,
  AccountSection,
  AccountText,
  AccountTitle,
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
  DeliveryContainer,
  DeliveryCopy,
  DeliveryImage,
  DeliveryLink,
  DeliveryList,
  DeliveryMedia,
  DeliveryPoint,
  DeliveryPointText,
  DeliveryPointTitle,
  DeliverySection,
  DeliveryText,
  DeliveryTitle,
  Hero,
  HeroActions,
  HeroContainer,
  HeroCopy,
  HeroImage,
  HeroMedia,
  HeroText,
  HeroTitle,
  InfoGrid,
  InfoItem,
  InfoItemText,
  InfoItemTitle,
  InfoSection,
  InfoText,
  InfoTitle,
  LoyaltyContainer,
  LoyaltyGrid,
  LoyaltyItem,
  LoyaltyItemText,
  LoyaltyItemTitle,
  LoyaltySection,
  LoyaltyText,
  LoyaltyTitle,
  PrimaryAction,
  ProcessContainer,
  ProcessCopy,
  ProcessDetail,
  ProcessDetailText,
  ProcessDetailTitle,
  ProcessDetails,
  ProcessImage,
  ProcessMainMedia,
  ProcessSecondaryMedia,
  ProcessSection,
  ProcessText,
  ProcessTitle,
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
  RoutineContainer,
  RoutineCopy,
  RoutineImage,
  RoutineMedia,
  RoutineSection,
  RoutineText,
  RoutineTitle,
  SecondaryAction,
  SectionHeading,
  SectionText,
  SectionTitle,
  ServiceFact,
  ServiceFactTerm,
  ServiceFactValue,
  ServiceFacts,
  ShopLink,
} from './elements';

export default function BrightStarHomeScreen() {
  const catalogProducts = useAppStore((state) => state.catalog.products);
  const products: readonly BrightStarProductPreview[] = catalogProducts
    .filter((product) => product.category === 'water' && product.isActive)
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      imageAlt: product.imageAlt,
      imageSrc: product.imageSrc,
      name: product.name,
      shortDescription: product.shortDescription,
      price: formatPhp(product.priceCentavos),
    }));
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power2.out' } })
          .from('[data-water-media]', { opacity: 0, x: -24, duration: 0.65 })
          .from('[data-water-copy]', { opacity: 0, y: 18, duration: 0.55 }, 0.08);

        const closingStage = rootRef.current?.querySelector('[data-water-closing-stage]');
        if (!closingStage || typeof IntersectionObserver === 'undefined') {
          return undefined;
        }

        const closingMedia = closingStage.querySelector('[data-water-closing-media]');
        const closingPanel = closingStage.querySelector('[data-water-closing-panel]');
        const closingFacts = closingStage.querySelectorAll('[data-water-closing-fact]');
        if (!closingMedia || !closingPanel) {
          return undefined;
        }

        let closingTimeline: gsap.core.Timeline | undefined;

        gsap.set(closingMedia, { opacity: 0, scale: 1.025 });
        gsap.set(closingPanel, { opacity: 0, x: 32 });
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
      <Hero aria-labelledby="brightstar-title">
        <HeroContainer>
          <HeroMedia data-water-media>
            <HeroImage
              alt={STOREFRONT_MEDIA.water.hero.alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              src={STOREFRONT_MEDIA.water.hero.src}
            />
          </HeroMedia>
          <HeroCopy data-water-copy>
            <HeroTitle id="brightstar-title">
              Purified water, ready for the household routine.
            </HeroTitle>
            <HeroText>
              Order refills, new containers, and practical water accessories in
              a storefront dedicated to Bright Star Water.
            </HeroText>
            <HeroActions>
              <PrimaryAction href="/brightstar/shop">
                Shop Bright Star Water
              </PrimaryAction>
              <SecondaryAction href="/brightstar/delivery">
                See delivery coverage
              </SecondaryAction>
            </HeroActions>
            <ServiceFacts>
              <ServiceFact>
                <ServiceFactTerm>Refills</ServiceFactTerm>
                <ServiceFactValue>5 gallon</ServiceFactValue>
              </ServiceFact>
              <ServiceFact>
                <ServiceFactTerm>Service area</ServiceFactTerm>
                <ServiceFactValue>Up to 10 km</ServiceFactValue>
              </ServiceFact>
              <ServiceFact>
                <ServiceFactTerm>Payment</ServiceFactTerm>
                <ServiceFactValue>COD or GCash</ServiceFactValue>
              </ServiceFact>
            </ServiceFacts>
          </HeroCopy>
        </HeroContainer>
      </Hero>

      <ProductsSection aria-labelledby="brightstar-products-title">
        <ProductsContainer>
          <SectionHeading>
            <SectionTitle id="brightstar-products-title">
              Bright Star essentials
            </SectionTitle>
            <SectionText>
              Water products remain separated from MRJE Gas while checkout,
              delivery information, and your order history stay connected.
            </SectionText>
          </SectionHeading>
          <ProductGrid>
            {products.map((product) => (
              <ProductItem
                href={`/brightstar/product/${product.id}`}
                key={product.id}
              >
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
          <ShopLink href="/brightstar/shop">Browse all water products</ShopLink>
        </ProductsContainer>
      </ProductsSection>

      <ProcessSection aria-labelledby="brightstar-process-title">
        <ProcessContainer>
          <ProcessMainMedia>
            <ProcessImage
              alt={STOREFRONT_MEDIA.water.refillStation.alt}
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              src={STOREFRONT_MEDIA.water.refillStation.src}
            />
          </ProcessMainMedia>
          <ProcessCopy>
            <ProcessTitle id="brightstar-process-title">
              A storefront shaped around refills, containers, and repeat needs.
            </ProcessTitle>
            <ProcessText>
              Bright Star keeps water ordering focused on the decisions households
              make repeatedly, from choosing a refill to planning the next delivery.
            </ProcessText>
            <ProcessDetails>
              <ProcessDetail>
                <ProcessDetailTitle>Refill or container</ProcessDetailTitle>
                <ProcessDetailText>
                  Product information makes the distinction visible before items reach the cart.
                </ProcessDetailText>
              </ProcessDetail>
              <ProcessDetail>
                <ProcessDetailTitle>Availability first</ProcessDetailTitle>
                <ProcessDetailText>
                  Customers can check current availability before starting checkout.
                </ProcessDetailText>
              </ProcessDetail>
              <ProcessDetail>
                <ProcessDetailTitle>Water-only browsing</ProcessDetailTitle>
                <ProcessDetailText>
                  The Bright Star catalog stays separate from LPG while the account remains shared.
                </ProcessDetailText>
              </ProcessDetail>
            </ProcessDetails>
            <ProcessSecondaryMedia>
              <ProcessImage
                alt={STOREFRONT_MEDIA.water.filtration.alt}
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                src={STOREFRONT_MEDIA.water.filtration.src}
              />
            </ProcessSecondaryMedia>
          </ProcessCopy>
        </ProcessContainer>
      </ProcessSection>

      <RoutineSection aria-labelledby="brightstar-routine-title">
        <RoutineContainer>
          <RoutineCopy>
            <RoutineTitle id="brightstar-routine-title">
              Make repeat water ordering feel routine, not repetitive.
            </RoutineTitle>
            <RoutineText>
              The experience is designed for customers who may need the same water
              product again. Product history, saved delivery information, and the
              shared account reduce the amount of information that has to be rediscovered.
            </RoutineText>
            <RoutineText>
              Customers can return to their order history, confirm what they ordered
              before, then continue into the Bright Star catalog without passing through MRJE products.
            </RoutineText>
          </RoutineCopy>
          <RoutineMedia>
            <RoutineImage
              alt={STOREFRONT_MEDIA.water.dispenser.alt}
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
              src={STOREFRONT_MEDIA.water.dispenser.src}
            />
          </RoutineMedia>
        </RoutineContainer>
      </RoutineSection>

      <DeliverySection aria-labelledby="brightstar-delivery-title">
        <DeliveryContainer>
          <DeliveryMedia>
            <DeliveryImage
              alt={STOREFRONT_MEDIA.water.delivery.alt}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              src={STOREFRONT_MEDIA.water.delivery.src}
            />
          </DeliveryMedia>
          <DeliveryCopy>
            <DeliveryTitle id="brightstar-delivery-title">
              Delivery planning happens before the final click.
            </DeliveryTitle>
            <DeliveryText>
              After an address is selected, the system shows the delivery zone
              and fee so the final review can include the complete order amount.
            </DeliveryText>
            <DeliveryList>
              <DeliveryPoint>
                <DeliveryPointTitle>0 to 3 km</DeliveryPointTitle>
                <DeliveryPointText>Free delivery within the closest service zone.</DeliveryPointText>
              </DeliveryPoint>
              <DeliveryPoint>
                <DeliveryPointTitle>Over 3 to 10 km</DeliveryPointTitle>
                <DeliveryPointText>Tiered fees are shown before the order is confirmed.</DeliveryPointText>
              </DeliveryPoint>
              <DeliveryPoint>
                <DeliveryPointTitle>Schedule at checkout</DeliveryPointTitle>
                <DeliveryPointText>Select an available date and delivery window during the delivery stage.</DeliveryPointText>
              </DeliveryPoint>
            </DeliveryList>
            <DeliveryLink href="/brightstar/delivery">Review Bright Star delivery</DeliveryLink>
          </DeliveryCopy>
        </DeliveryContainer>
      </DeliverySection>

      <InfoSection aria-labelledby="brightstar-payment-title">
        <ProductsContainer>
          <div>
            <InfoTitle id="brightstar-payment-title">
              Payment is shown beside the information that affects the total.
            </InfoTitle>
            <InfoText>
              Customers choose between cash on delivery and GCash after delivery details are available. GCash orders enter payment verification before fulfillment proceeds.
            </InfoText>
          </div>
          <InfoGrid>
            <InfoItem>
              <InfoItemTitle>Cash on delivery</InfoItemTitle>
              <InfoItemText>Review the full amount and prepare the displayed total for collection on delivery.</InfoItemText>
            </InfoItem>
            <InfoItem>
              <InfoItemTitle>GCash payment review</InfoItemTitle>
              <InfoItemText>The order can enter an awaiting-verification state until payment verification is completed.</InfoItemText>
            </InfoItem>
            <InfoItem>
              <InfoItemTitle>One review screen</InfoItemTitle>
              <InfoItemText>Products, quantity, delivery fee, schedule, address, payment method, and total remain visible together.</InfoItemText>
            </InfoItem>
          </InfoGrid>
        </ProductsContainer>
      </InfoSection>

      <AccountSection aria-labelledby="brightstar-account-title">
        <AccountContainer>
          <AccountCopy>
            <AccountTitle id="brightstar-account-title">
              One account keeps water orders and gas orders connected without mixing the storefronts.
            </AccountTitle>
            <AccountText>
              A Bright Star customer can review active deliveries, completed orders,
              saved delivery information, and loyalty activity from the same account
              used for MRJE Gas. The operational history is shared even though the shopping experiences are distinct.
            </AccountText>
            <ShopLink href="/customer/orders">Review my order history</ShopLink>
          </AccountCopy>
          <AccountMedia>
            <AccountImage
              alt={STOREFRONT_MEDIA.water.filtration.alt}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              src={STOREFRONT_MEDIA.water.filtration.src}
            />
          </AccountMedia>
        </AccountContainer>
      </AccountSection>

      <LoyaltySection aria-labelledby="brightstar-loyalty-title">
        <LoyaltyContainer>
          <div>
            <LoyaltyTitle id="brightstar-loyalty-title">
              Loyalty should explain the value of repeat orders.
            </LoyaltyTitle>
            <LoyaltyText>
              The loyalty area shows points, peso-equivalent value, recent
              loyalty activity, and qualification progress. The final earning rule
              remains configurable until the business rule is confirmed.
            </LoyaltyText>
          </div>
          <LoyaltyGrid>
            <LoyaltyItem>
              <LoyaltyItemTitle>Current balance</LoyaltyItemTitle>
              <LoyaltyItemText>See the points associated with the shared customer account.</LoyaltyItemText>
            </LoyaltyItem>
            <LoyaltyItem>
              <LoyaltyItemTitle>Recent activity</LoyaltyItemTitle>
              <LoyaltyItemText>Understand which eligible order events affected the displayed balance.</LoyaltyItemText>
            </LoyaltyItem>
            <LoyaltyItem>
              <LoyaltyItemTitle>Configurable rules</LoyaltyItemTitle>
              <LoyaltyItemText>Reward earning and qualification details remain aligned with the configured loyalty policy.</LoyaltyItemText>
            </LoyaltyItem>
          </LoyaltyGrid>
        </LoyaltyContainer>
      </LoyaltySection>

      <ClosingSection aria-labelledby="brightstar-closing-title">
        <ProductsContainer>
          <ClosingStage data-water-closing-stage>
            <ClosingMedia data-water-closing-media>
              <ClosingImage
                alt={STOREFRONT_MEDIA.water.delivery.alt}
                fill
                sizes="(max-width: 900px) 100vw, 72vw"
                src={STOREFRONT_MEDIA.water.delivery.src}
              />
            </ClosingMedia>
            <ClosingPanel data-water-closing-panel>
              <ClosingTitle id="brightstar-closing-title">
                Keep the household supplied without starting from scratch.
              </ClosingTitle>
              <ClosingText>
                Pick the next refill or container, confirm availability, choose
                the delivery schedule, and see the final fee before the order is
                submitted.
              </ClosingText>
              <ClosingPrimary href="/brightstar/shop">
                <ClosingPrimaryLabel>Shop Bright Star Water</ClosingPrimaryLabel>
                <ClosingPrimaryArrow aria-hidden="true" data-closing-arrow>↗</ClosingPrimaryArrow>
              </ClosingPrimary>
              <ClosingSubRow>
                <ClosingSecondary href="/mrje">Need LPG instead? Visit MRJE Gas</ClosingSecondary>
                <ClosingNote>One account keeps both storefronts connected.</ClosingNote>
              </ClosingSubRow>
              <ClosingFacts>
                <ClosingFact data-water-closing-fact>
                  <ClosingFactLabel>Refill</ClosingFactLabel>
                  <ClosingFactValue>5 gallon water options</ClosingFactValue>
                </ClosingFact>
                <ClosingFact data-water-closing-fact>
                  <ClosingFactLabel>Delivery</ClosingFactLabel>
                  <ClosingFactValue>Service coverage up to 10 km</ClosingFactValue>
                </ClosingFact>
                <ClosingFact data-water-closing-fact>
                  <ClosingFactLabel>Checkout</ClosingFactLabel>
                  <ClosingFactValue>Fee, schedule, COD or GCash shown before confirmation</ClosingFactValue>
                </ClosingFact>
              </ClosingFacts>
            </ClosingPanel>
          </ClosingStage>
        </ProductsContainer>
      </ClosingSection>
    </Root>
  );
}
