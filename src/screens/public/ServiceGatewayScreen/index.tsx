'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { STOREFRONT_MEDIA } from '@/config';
import type { ServiceGatewayChoice } from './interface';
import {
  ChoiceAction,
  ChoiceBand,
  ChoiceContent,
  ChoiceDescription,
  ChoiceGrid,
  ChoiceImage,
  ChoiceLink,
  ChoiceName,
  ChoiceOverlay,
  IntroBand,
  IntroContainer,
  IntroText,
  Root,
  Title,
} from './elements';

const choices: readonly ServiceGatewayChoice[] = [
  {
    name: 'MRJE Gas',
    description:
      'Household LPG refills and compatible accessories with scheduled local delivery.',
    action: 'Enter the gas storefront',
    href: '/mrje',
    imageSrc: STOREFRONT_MEDIA.gas.hero.src,
    imageAlt: STOREFRONT_MEDIA.gas.hero.alt,
    tone: 'gas',
  },
  {
    name: 'Bright Star Water',
    description:
      'Purified water refills, containers, and household water supplies delivered on schedule.',
    action: 'Enter the water storefront',
    href: '/brightstar',
    imageSrc: STOREFRONT_MEDIA.water.hero.src,
    imageAlt: STOREFRONT_MEDIA.water.hero.alt,
    tone: 'water',
  },
];

export default function ServiceGatewayScreen() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
        timeline
          .from('[data-gateway-copy]', { opacity: 0, y: 18, duration: 0.5 })
          .from(
            '[data-gateway-choice]',
            { opacity: 0, y: 22, duration: 0.55, stagger: 0.08 },
            0.12,
          );
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <Root ref={rootRef}>
      <IntroBand>
        <IntroContainer data-gateway-copy>
          <Title>What do you need delivered today?</Title>
          <IntroText>
            Choose the storefront you need. Your cart, account, delivery details,
            and order history stay connected across both services.
          </IntroText>
        </IntroContainer>
      </IntroBand>
      <ChoiceBand>
        <ChoiceGrid aria-label="Choose a storefront">
          {choices.map((choice) => (
            <ChoiceLink
              data-gateway-choice
              href={choice.href}
              key={choice.href}
              $tone={choice.tone}
            >
              <ChoiceImage
                alt={choice.imageAlt}
                fill
                priority
                sizes="(max-width: 600px) 100vw, 50vw"
                src={choice.imageSrc}
              />
              <ChoiceOverlay $tone={choice.tone} />
              <ChoiceContent>
                <ChoiceName>{choice.name}</ChoiceName>
                <ChoiceDescription>{choice.description}</ChoiceDescription>
                <ChoiceAction>{choice.action}</ChoiceAction>
              </ChoiceContent>
            </ChoiceLink>
          ))}
        </ChoiceGrid>
      </ChoiceBand>
    </Root>
  );
}
