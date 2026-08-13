import type { AuthScaffoldProps } from './interface';
import {
  BrandLink,
  Description,
  FormPane,
  FormRegion,
  MediaCaption,
  MediaImage,
  MediaPane,
  MediaText,
  MediaTitle,
  Root,
  SkipLink,
  Title,
} from './elements';

export default function AuthScaffold({
  children,
  description,
  title,
}: AuthScaffoldProps) {
  return (
    <Root>
      <SkipLink href="#main-content">Skip to form</SkipLink>
      <FormPane id="main-content" tabIndex={-1}>
        <BrandLink href="/">MRJE Gas + Bright Star Water</BrandLink>
        <FormRegion id="auth-form">
          <Title>{title}</Title>
          <Description>{description}</Description>
          {children}
        </FormRegion>
      </FormPane>
      <MediaPane aria-hidden="true">
        <MediaImage
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 100vw, 57vw"
          src="/images/mrje-brightstar-hero.webp"
        />
        <MediaCaption>
          <MediaTitle>One convenient local ordering service</MediaTitle>
          <MediaText>
            Browse LPG and purified water, schedule delivery, and follow each
            order from confirmation through delivery.
          </MediaText>
        </MediaCaption>
      </MediaPane>
    </Root>
  );
}
