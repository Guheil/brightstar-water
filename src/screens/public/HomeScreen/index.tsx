'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type {
  HomeCategory,
  HomeDeliveryZone,
  HomeProduct,
} from './interface';
import {
  CategoryCallout,
  CategoryCopy,
  CategoryDescription,
  CategoryGrid,
  CategoryImage,
  CategoryMedia,
  CategoryPanel,
  CategoryTitle,
  DetailLink,
  DetailList,
  DetailRow,
  DetailsInner,
  DetailsSection,
  DetailText,
  DetailTitle,
  DeliveryDistance,
  DeliveryFee,
  DeliveryRuler,
  DeliveryRulerCompact,
  DeliveryRulerLead,
  DeliveryZone,
  DeliveryZoneTrack,
  HeroActions,
  HeroCopy,
  HeroDescription,
  HeroGrid,
  HeroImage,
  HeroMedia,
  HeroSection,
  HeroTitle,
  PrimaryAction,
  ProcessGrid,
  ProcessInner,
  ProcessItem,
  ProcessSection,
  ProcessText,
  ProcessTitle,
  ProductDetail,
  ProductImage,
  ProductItem,
  ProductLink,
  ProductList,
  ProductMedia,
  ProductMeta,
  ProductName,
  ProductPrice,
  ProductsInner,
  ProductsSection,
  Root,
  Section,
  SectionHeadingRow,
  SectionIntro,
  SectionTitle,
  TextLink,
} from './elements';

const categories: HomeCategory[] = [
  {
    title: 'Gas for the kitchen',
    description:
      'Household LPG cylinders and practical accessories, with availability shown before you order.',
    href: '/shop?category=gas',
    image: '/images/product-lpg-11kg.webp',
    imageAlt: 'Unbranded orange household LPG cylinder',
    tone: 'gas',
  },
  {
    title: 'Water for the household',
    description:
      'Purified water refills, containers, and bottled options prepared for scheduled delivery.',
    href: '/shop?category=water',
    image: '/images/product-water-5gal.webp',
    imageAlt: 'Clear five-gallon purified water container',
    tone: 'water',
  },
];

const featuredProducts: HomeProduct[] = [
  {
    id: 'product-gas-11kg',
    name: '11 kg LPG cylinder',
    detail: 'Household cylinder refill or exchange',
    price: '₱980',
    image: '/images/product-lpg-11kg.webp',
    imageAlt: 'Orange 11-kilogram LPG cylinder',
    tone: 'gas',
  },
  {
    id: 'product-water-refill',
    name: '5-gallon water refill',
    detail: 'Purified water for your existing container',
    price: '₱45',
    image: '/images/product-water-5gal.webp',
    imageAlt: 'Five-gallon purified water container',
    tone: 'water',
  },
  {
    id: 'product-water-bottles',
    name: '1-liter water pack',
    detail: 'Six bottles for home or small events',
    price: '₱150',
    image: '/images/product-water-bottles.webp',
    imageAlt: 'Six clear one-liter purified water bottles',
    tone: 'water',
  },
];

const deliveryZones: HomeDeliveryZone[] = [
  { distance: '≤ 3 km', fee: 'Free' },
  { distance: '≤ 6 km', fee: '₱30' },
  { distance: '≤ 10 km', fee: '₱50' },
];

export default function HomeScreen() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          allowMotion: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          if (!context.conditions?.allowMotion) {
            return;
          }

          const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
          timeline
            .from('[data-hero-copy]', { opacity: 0, y: 18, duration: 0.55 })
            .from(
              '[data-hero-media]',
              { clipPath: 'inset(0 0 100% 0)', duration: 0.75 },
              0.08,
            );
        },
      );

      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <Root ref={rootRef}>
      <HeroSection aria-labelledby="home-title">
        <HeroMedia data-hero-media>
          <HeroImage
            src="/images/mrje-brightstar-hero.webp"
            alt="LPG cylinder and purified water containers at a local delivery shop"
            fill
            priority
            sizes="100vw"
          />
        </HeroMedia>
        <HeroGrid>
          <HeroCopy data-hero-copy>
            <HeroTitle id="home-title">
              Gas and water, brought to your door.
            </HeroTitle>
            <HeroDescription>
              Order LPG and purified water with scheduled local delivery.
            </HeroDescription>
            <HeroActions>
              <PrimaryAction href="/shop">Shop essentials</PrimaryAction>
              <DeliveryRuler
                aria-label="View delivery fees: up to 3 kilometers free, up to 6 kilometers 30 pesos, and up to 10 kilometers 50 pesos"
                href="/about-delivery"
              >
                <DeliveryRulerLead aria-hidden="true">
                  From San Lorenzo Ruiz
                  <span>Delivery fees</span>
                </DeliveryRulerLead>
                <DeliveryZoneTrack aria-hidden="true">
                  {deliveryZones.map((zone) => (
                    <DeliveryZone key={zone.distance}>
                      <DeliveryDistance>{zone.distance}</DeliveryDistance>
                      <DeliveryFee>{zone.fee}</DeliveryFee>
                    </DeliveryZone>
                  ))}
                </DeliveryZoneTrack>
                <DeliveryRulerCompact aria-hidden="true">
                  3 km Free · 6 km ₱30 · 10 km ₱50
                </DeliveryRulerCompact>
              </DeliveryRuler>
            </HeroActions>
          </HeroCopy>
        </HeroGrid>
      </HeroSection>

      <Section aria-labelledby="category-title">
        <SectionHeadingRow>
          <div>
            <SectionTitle id="category-title">Start with what you need</SectionTitle>
            <SectionIntro>
              Gas and water share one checkout, while stock and availability
              remain clear for each item.
            </SectionIntro>
          </div>
        </SectionHeadingRow>
        <CategoryGrid>
          {categories.map((category) => (
            <CategoryPanel
              key={category.tone}
              href={category.href}
              tone={category.tone}
            >
              <CategoryCopy>
                <div>
                  <CategoryTitle>{category.title}</CategoryTitle>
                  <CategoryDescription>{category.description}</CategoryDescription>
                </div>
                <CategoryCallout>Browse {category.tone}</CategoryCallout>
              </CategoryCopy>
              <CategoryMedia>
                <CategoryImage
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(max-width: 600px) 100vw, 40vw"
                />
              </CategoryMedia>
            </CategoryPanel>
          ))}
        </CategoryGrid>
      </Section>

      <ProductsSection aria-labelledby="popular-title">
        <ProductsInner>
          <SectionHeadingRow>
            <div>
              <SectionTitle id="popular-title">Common household orders</SectionTitle>
              <SectionIntro>
                A practical starting point for repeat gas and water deliveries.
              </SectionIntro>
            </div>
            <TextLink href="/shop">View all products</TextLink>
          </SectionHeadingRow>
          <ProductList>
            {featuredProducts.map((product) => (
              <ProductItem key={product.id}>
                <ProductLink href={`/product/${product.id}`}>
                  <ProductMedia>
                    <ProductImage
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                  </ProductMedia>
                  <ProductMeta>
                    <div>
                      <ProductName>{product.name}</ProductName>
                      <ProductDetail>{product.detail}</ProductDetail>
                    </div>
                    <ProductPrice tone={product.tone}>{product.price}</ProductPrice>
                  </ProductMeta>
                </ProductLink>
              </ProductItem>
            ))}
          </ProductList>
        </ProductsInner>
      </ProductsSection>

      <DetailsSection aria-labelledby="service-details-title">
        <DetailsInner>
          <SectionHeadingRow>
            <div>
              <SectionTitle id="service-details-title">
                Clear terms before you order
              </SectionTitle>
              <SectionIntro>
                Delivery, payment, and loyalty rules remain visible instead of
                appearing only at the final checkout step.
              </SectionIntro>
            </div>
          </SectionHeadingRow>
          <DetailList>
            <DetailRow>
              <DetailTitle>Delivery coverage</DetailTitle>
              <DetailText>
                Fictional address fixtures determine whether delivery is free,
                ₱30, ₱50, or outside the 10 km prototype service area.
              </DetailText>
            </DetailRow>
            <DetailRow>
              <DetailTitle>Payment</DetailTitle>
              <DetailText>
                Choose cash on delivery or a clearly labelled GCash
                demonstration. The prototype never accepts real payments.
              </DetailText>
            </DetailRow>
            <DetailRow>
              <DetailTitle>Loyalty</DetailTitle>
              <DetailText>
                The current demo awards one point per ₱100 on qualifying
                merchandise subtotals of at least ₱500 after delivery. Reward
                redemption remains disabled until the business rule is final.
              </DetailText>
            </DetailRow>
          </DetailList>
          <DetailLink href="/about-delivery">
            Read delivery zones and payment details
          </DetailLink>
        </DetailsInner>
      </DetailsSection>

      <ProcessSection aria-labelledby="process-title">
        <ProcessInner>
          <SectionHeadingRow>
            <div>
              <SectionTitle id="process-title">From store to doorstep</SectionTitle>
              <SectionIntro>
                The prototype keeps each role informed without pretending to
                provide live GPS tracking.
              </SectionIntro>
            </div>
          </SectionHeadingRow>
          <ProcessGrid>
            <ProcessItem>
              <ProcessTitle>Choose</ProcessTitle>
              <ProcessText>Browse current products and availability.</ProcessText>
            </ProcessItem>
            <ProcessItem>
              <ProcessTitle>Schedule</ProcessTitle>
              <ProcessText>Select a delivery fixture and time window.</ProcessText>
            </ProcessItem>
            <ProcessItem>
              <ProcessTitle>Confirm</ProcessTitle>
              <ProcessText>Review items, fee, payment, and address.</ProcessText>
            </ProcessItem>
            <ProcessItem>
              <ProcessTitle>Follow</ProcessTitle>
              <ProcessText>See status updates through final delivery.</ProcessText>
            </ProcessItem>
          </ProcessGrid>
        </ProcessInner>
      </ProcessSection>
    </Root>
  );
}
