export interface DeliveryZoneView {
  boundary: string;
  fee: string;
  title: string;
}

export interface PaymentOptionView {
  description: string;
  title: string;
}

export interface DeliveryInfoScreenProps {
  shopHref?: string;
  storefrontName?: string;
}
