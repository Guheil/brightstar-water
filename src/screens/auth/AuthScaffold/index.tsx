import { STOREFRONT_MEDIA } from '@/config';
import type { AuthScaffoldProps } from './interface';
import {
  BrandLink,
  BrandLockup,
  BrandLogoFrame,
  BrandLogoImage,
  ContentFrame,
  Description,
  DesktopBrandLink,
  FormPane,
  FormPaneInner,
  FormRegion,
  MediaBrand,
  MediaBrandRail,
  MediaBrandText,
  MediaBrandTitle,
  MediaCell,
  MediaGrid,
  MediaImage,
  MediaPane,
  MobileHeader,
  MobileHeaderInner,
  Root,
  SkipLink,
  Title,
} from './elements';

const mrjeLogoSrc = '/brand/mrje-gas-logo.png';
const brightStarLogoSrc = '/brand/brightstar-water-logo.png';

export default function AuthScaffold({ children, description, title }: AuthScaffoldProps) {
  return (
    <Root>
      <SkipLink href="#main-content">Skip to form</SkipLink>
      <ContentFrame>
        <MobileHeader>
          <MobileHeaderInner>
            <BrandLink href="/" aria-label="Return to MRJE and Bright Star storefront selector">
              <BrandLockup>
                <BrandLogoFrame>
                  <BrandLogoImage
                    alt="MRJE Gas"
                    fill
                    priority
                    sizes="(max-width: 600px) 112px, 144px"
                    src={mrjeLogoSrc}
                  />
                </BrandLogoFrame>
                <BrandLogoFrame>
                  <BrandLogoImage
                    alt="Bright Star Water"
                    fill
                    priority
                    sizes="(max-width: 600px) 112px, 144px"
                    src={brightStarLogoSrc}
                  />
                </BrandLogoFrame>
              </BrandLockup>
            </BrandLink>
          </MobileHeaderInner>
        </MobileHeader>

        <MediaPane aria-hidden="true">
          <MediaGrid>
            <MediaCell>
              <MediaImage
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 54vw, 50vw"
                src={STOREFRONT_MEDIA.gas.delivery.src}
              />
            </MediaCell>
            <MediaCell>
              <MediaImage
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 46vw, 50vw"
                src={STOREFRONT_MEDIA.water.delivery.src}
              />
            </MediaCell>
          </MediaGrid>
          <MediaBrandRail>
            <MediaBrand>
              <MediaBrandTitle>Two storefronts. One operations platform.</MediaBrandTitle>
              <MediaBrandText>
                MRJE Gas and Bright Star Water share account, order, inventory, and delivery workflows without mixing their customer storefronts.
              </MediaBrandText>
            </MediaBrand>
          </MediaBrandRail>
        </MediaPane>

        <FormPane id="main-content" tabIndex={-1}>
          <FormPaneInner>
            <DesktopBrandLink href="/" aria-label="Return to MRJE and Bright Star storefront selector">
              <BrandLockup>
                <BrandLogoFrame>
                  <BrandLogoImage
                    alt="MRJE Gas"
                    fill
                    priority
                    sizes="144px"
                    src={mrjeLogoSrc}
                  />
                </BrandLogoFrame>
                <BrandLogoFrame>
                  <BrandLogoImage
                    alt="Bright Star Water"
                    fill
                    priority
                    sizes="144px"
                    src={brightStarLogoSrc}
                  />
                </BrandLogoFrame>
              </BrandLockup>
            </DesktopBrandLink>
            <FormRegion id="auth-form">
              <Title>{title}</Title>
              <Description>{description}</Description>
              {children}
            </FormRegion>
          </FormPaneInner>
        </FormPane>
      </ContentFrame>
    </Root>
  );
}
