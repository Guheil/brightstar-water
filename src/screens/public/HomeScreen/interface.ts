export interface HomeCategory {
  title: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  tone: 'gas' | 'water';
}

export interface HomeProduct {
  id: string;
  name: string;
  detail: string;
  price: string;
  image: string;
  imageAlt: string;
  tone: 'gas' | 'water';
}

export interface HomeDeliveryZone {
  distance: string;
  fee: string;
}
