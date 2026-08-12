'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import {
  customerHeaderMotion,
  transitionDurations,
} from '@/theme/transitions';
import {
  AccountActionLink,
  ActionLink,
  ActionText,
  BrandLink,
  CartCount,
  CloseButton,
  CustomerDrawer,
  DesktopNavigation,
  DrawerBody,
  DrawerHeader,
  HeaderContainer,
  HeaderLink,
  HeaderRoot,
  LogoFrame,
  LogoImage,
  MegaMenu,
  MegaMenuGroup,
  MegaMenuInner,
  MegaMenuLink,
  MegaMenuLinkDescription,
  MegaMenuLinkLabel,
  MegaMenuTitle,
  MenuButton,
  MobileMenuGroup,
  MobileMenuTitle,
  MobileNavigation,
  MobileNavigationLink,
  MobileUtilityLink,
  MobileUtilityLinks,
  SearchActionLink,
  ShopMenuButton,
  SkipLink,
  UtilityNavigation,
} from './elements';
import type { CustomerHeaderProps } from './interface';
import type { CustomerMegaMenuPhase } from './interface';

const mobileNavigationId = 'customer-mobile-navigation';
const shopMenuId = 'customer-shop-menu';
const sequencedMotionDelay =
  transitionDurations.complex + customerHeaderMotion.menuPause;
const subscribeToScroll = (listener: () => void) => {
  window.addEventListener('scroll', listener, { passive: true });
  return () => window.removeEventListener('scroll', listener);
};
const getScrollSnapshot = () => window.scrollY > 8;
const getServerScrollSnapshot = () => false;

export default function CustomerHeader({
  accountHref,
  activeHref,
  brandName,
  cartCount = 0,
  cartHref,
  className,
  condensed = false,
  homeHref = '/',
  logoSrc = '/logo.png',
  mainId = 'main-content',
  megaMenuGroups,
  navigation,
  searchHref,
  transparentAtTop = false,
}: CustomerHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopMenuPhase, setShopMenuPhase] =
    useState<CustomerMegaMenuPhase>('closed');
  const headerRef = useRef<HTMLElement>(null);
  const shopButtonRef = useRef<HTMLButtonElement>(null);
  const motionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasScrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrollSnapshot,
    getServerScrollSnapshot,
  );
  const shopMenuRequested =
    shopMenuPhase === 'opening' || shopMenuPhase === 'open';
  const shopMenuSurfaceLocked = shopMenuPhase !== 'closed';
  const shopMenuVisible = shopMenuPhase === 'open';
  const transparent =
    transparentAtTop && !hasScrolled && !shopMenuSurfaceLocked;
  const cartLabel = cartCount
    ? `Cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`
    : 'Cart';

  const clearMotionTimers = useCallback(() => {
    motionTimersRef.current.forEach(clearTimeout);
    motionTimersRef.current = [];
  }, []);

  const scheduleMotion = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      motionTimersRef.current = motionTimersRef.current.filter(
        (pendingTimer) => pendingTimer !== timer,
      );
      callback();
    }, delay);
    motionTimersRef.current.push(timer);
  }, []);

  const prefersReducedMotion = useCallback(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const openMegaMenu = useCallback(() => {
    clearMotionTimers();
    if (prefersReducedMotion()) {
      setShopMenuPhase('open');
      return;
    }

    setShopMenuPhase('opening');
    scheduleMotion(() => setShopMenuPhase('open'), sequencedMotionDelay);
  }, [clearMotionTimers, prefersReducedMotion, scheduleMotion]);

  const closeMegaMenu = useCallback((restoreFocus = false) => {
    clearMotionTimers();
    if (prefersReducedMotion()) {
      setShopMenuPhase('closed');
      if (restoreFocus) shopButtonRef.current?.focus();
      return;
    }

    setShopMenuPhase('closing');
    if (restoreFocus) shopButtonRef.current?.focus();
    scheduleMotion(() => setShopMenuPhase('closed'), sequencedMotionDelay);
  }, [clearMotionTimers, prefersReducedMotion, scheduleMotion]);

  const toggleMegaMenu = useCallback(() => {
    if (shopMenuRequested) closeMegaMenu();
    else openMegaMenu();
  }, [closeMegaMenu, openMegaMenu, shopMenuRequested]);

  useEffect(() => () => clearMotionTimers(), [clearMotionTimers]);

  useEffect(() => {
    if (!shopMenuRequested) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeMegaMenu();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMegaMenu(true);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeMegaMenu, shopMenuRequested]);

  return (
    <HeaderRoot
      className={className}
      data-surface={transparent ? 'transparent' : 'solid'}
      data-shop-menu-phase={shopMenuPhase}
      ref={headerRef}
      $condensed={condensed}
      $transparent={transparent}
    >
      <SkipLink href={`#${mainId}`}>Skip to main content</SkipLink>
      <HeaderContainer>
        <BrandLink aria-label={brandName} href={homeHref}>
          <LogoFrame>
            <LogoImage
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(max-width: 600px) 96px, (max-width: 1200px) 120px, 144px"
              src={logoSrc}
              $inverted={transparent}
            />
          </LogoFrame>
        </BrandLink>

        <DesktopNavigation aria-label="Customer navigation">
          <ShopMenuButton
            aria-controls={shopMenuId}
            aria-expanded={shopMenuRequested}
            onClick={toggleMegaMenu}
            ref={shopButtonRef}
            type="button"
            $active={activeHref === '/shop'}
          >
            Shop
            <ChevronDown aria-hidden="true" />
          </ShopMenuButton>
          {navigation.map((item) => (
            <HeaderLink
              aria-current={activeHref === item.href ? 'page' : undefined}
              href={item.href}
              key={item.href}
              $active={activeHref === item.href}
            >
              {item.label}
            </HeaderLink>
          ))}
        </DesktopNavigation>

        <UtilityNavigation aria-label="Customer utilities">
          {searchHref ? (
            <SearchActionLink aria-label="Search products" href={searchHref}>
              <Search aria-hidden="true" />
              <ActionText>Search</ActionText>
            </SearchActionLink>
          ) : null}
          <ActionLink aria-label={cartLabel} href={cartHref}>
            <ShoppingCart aria-hidden="true" />
            <ActionText>Cart</ActionText>
            {cartCount > 0 ? <CartCount>· {cartCount}</CartCount> : null}
          </ActionLink>
          <AccountActionLink aria-label="Customer account" href={accountHref}>
            <UserRound aria-hidden="true" />
            <ActionText>Account</ActionText>
          </AccountActionLink>
          <MenuButton
            aria-controls={mobileNavigationId}
            aria-expanded={menuOpen}
            aria-label="Open navigation"
            onClick={() => {
              clearMotionTimers();
              setShopMenuPhase('closed');
              setMenuOpen(true);
            }}
          >
            <Menu aria-hidden="true" />
          </MenuButton>
        </UtilityNavigation>
      </HeaderContainer>

      <MegaMenu
        aria-hidden={!shopMenuVisible}
        aria-label="Shop menu"
        id={shopMenuId}
        role="region"
        $open={shopMenuVisible}
      >
        <MegaMenuInner $open={shopMenuVisible}>
          {megaMenuGroups.map((group) => (
            <MegaMenuGroup key={group.title}>
              <MegaMenuTitle>{group.title}</MegaMenuTitle>
              {group.links.map((item) => (
                <MegaMenuLink
                  href={item.href}
                  key={item.href}
                  onClick={() => closeMegaMenu()}
                  $tone={item.tone ?? 'neutral'}
                >
                  <MegaMenuLinkLabel>{item.label}</MegaMenuLinkLabel>
                  {item.description ? (
                    <MegaMenuLinkDescription>
                      {item.description}
                    </MegaMenuLinkDescription>
                  ) : null}
                </MegaMenuLink>
              ))}
            </MegaMenuGroup>
          ))}
        </MegaMenuInner>
      </MegaMenu>

      <CustomerDrawer
        anchor="right"
        id={mobileNavigationId}
        onClose={() => setMenuOpen(false)}
        open={menuOpen}
      >
        <DrawerBody>
          <DrawerHeader>
            <BrandLink
              aria-label={brandName}
              href={homeHref}
              onClick={() => setMenuOpen(false)}
            >
              <LogoFrame>
                <LogoImage
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="144px"
                  src={logoSrc}
                  $inverted={false}
                />
              </LogoFrame>
            </BrandLink>
            <CloseButton
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              <X aria-hidden="true" />
            </CloseButton>
          </DrawerHeader>

          <MobileNavigation aria-label="Customer mobile navigation">
            {megaMenuGroups.map((group) => (
              <MobileMenuGroup key={group.title}>
                <MobileMenuTitle>{group.title}</MobileMenuTitle>
                {group.links.map((item) => (
                  <MobileNavigationLink
                    href={item.href}
                    key={item.href}
                    onClick={() => setMenuOpen(false)}
                    $tone={item.tone ?? 'neutral'}
                  >
                    {item.label}
                  </MobileNavigationLink>
                ))}
              </MobileMenuGroup>
            ))}
          </MobileNavigation>

          <MobileUtilityLinks>
            {searchHref ? (
              <MobileUtilityLink href={searchHref} onClick={() => setMenuOpen(false)}>
                <Search aria-hidden="true" />
                Search
              </MobileUtilityLink>
            ) : null}
            <MobileUtilityLink href={accountHref} onClick={() => setMenuOpen(false)}>
              <UserRound aria-hidden="true" />
              Account
            </MobileUtilityLink>
          </MobileUtilityLinks>
        </DrawerBody>
      </CustomerDrawer>
    </HeaderRoot>
  );
}
