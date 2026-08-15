export interface StorefrontMediaAsset {
  alt: string;
  src: string;
}

export const STOREFRONT_MEDIA = {
  gas: {
    hero: {
      src: 'https://images.pexels.com/photos/16271901/pexels-photo-16271901.jpeg',
      alt: 'Rows of real LPG cylinders prepared for distribution',
    },
    kitchen: {
      src: 'https://images.pexels.com/photos/32117061/pexels-photo-32117061.jpeg',
      alt: 'Chef cooking on a real gas stove in a kitchen',
    },
    cylinder: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/9/94/LPG_Cylinders.jpg',
      alt: 'Real LPG cylinders stored in a secured cylinder area',
    },
    delivery: {
      src: 'https://images.pexels.com/photos/36249352/pexels-photo-36249352.jpeg',
      alt: 'Worker standing beside a truck carrying LPG cylinders for delivery',
    },
  },
  water: {
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Exterior_of_a_water_refilling_station_in_Lobo%2C_Batangas%2C_Philippines_%282025%29..jpg',
      alt: 'Exterior of a real water refilling station in Lobo, Batangas',
    },
    dispenser: {
      src: 'https://images.pexels.com/photos/6812505/pexels-photo-6812505.jpeg',
      alt: 'Clear drinking water bottle connected to a dispenser',
    },
    refillStation: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Water_dispensing_units_inside_a_water_refilling_station_in_Lobo%2C_Batangas_%282025%29.jpg',
      alt: 'Water dispensing units inside a real water refilling station in Lobo, Batangas',
    },
    filtration: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Filtration_and_purification_system_inside_a_water_refilling_station_in_Lobo%2C_Batangas_%282025%29.jpg',
      alt: 'Filtration and purification equipment inside a real water refilling station in Lobo, Batangas',
    },
    delivery: {
      src: 'https://images.pexels.com/photos/20571710/pexels-photo-20571710.jpeg',
      alt: 'Delivery rider transporting large water bottles through an urban neighborhood',
    },
  },
} as const;
