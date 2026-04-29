// Comprehensive Product Catalog with variants organized by supplier and type
import type { Product } from '../types/quote';

export interface ProductVariant {
  name: string;
  description: string;
  products: Product[];
}

export interface ProductCategory {
  category: string;
  supplier: string;
  variants: ProductVariant[];
}

export const productCatalog: ProductCategory[] = [
  {
    category: "Tata On-Grid SPS",
    supplier: "Tata (560wp Modules)",
    variants: [
      {
        name: "Single Phase Systems",
        description: "Tata on-grid solar systems (Single Phase) with 560wp modules",
        products: [
          { kWp: 2.24, phase: 1, module: 560, qty: 4, price: 130000, wire: 150, outOfVns: 5000 },
          { kWp: 3.36, phase: 1, module: 560, qty: 6, price: 180000, wire: 150, outOfVns: 5000 },
          { kWp: 4.48, phase: 1, module: 560, qty: 8, price: 240000, wire: 150, outOfVns: 5000 },
          { kWp: 5.04, phase: 1, module: 560, qty: 9, price: 270000, wire: 150, outOfVns: 5000 },
          { kWp: 5.60, phase: 1, module: 560, qty: 9, price: 300000, wire: 150, outOfVns: 5000 },
        ],
      },
      {
        name: "Three Phase Systems",
        description: "Tata on-grid solar systems (Three Phase) with 560wp modules",
        products: [
          { kWp: 5.04, phase: 3, module: 560, qty: 9, price: 300000, wire: 225, outOfVns: 5000 },
          { kWp: 6.16, phase: 3, module: 560, qty: 11, price: 345000, wire: 225, outOfVns: 5000 },
          { kWp: 8.40, phase: 3, module: 560, qty: 15, price: 440000, wire: 225, outOfVns: 5000 },
          { kWp: 10.08, phase: 3, module: 560, qty: 18, price: 510000, wire: 225, outOfVns: 5000 },
        ],
      },
    ],
  },
  {
    category: "Waaree/Adani/Premier TOPCON",
    supplier: "Waaree/Adani/Premier (580/600wp TOPCON Modules)",
    variants: [
      {
        name: "Single Phase Systems",
        description: "On-grid systems with 580/600wp TOPCON modules (Single Phase)",
        products: [
          { kWp: 2.32, phase: 1, module: 580, qty: 4, price: 135000, wire: 150, outOfVns: 5000 },
          { kWp: 3.00, phase: 1, module: 600, qty: 5, price: 180000, wire: 150, outOfVns: 5000 },
          { kWp: 3.48, phase: 1, module: 580, qty: 6, price: 185000, wire: 150, outOfVns: 5000 },
          { kWp: 4.64, phase: 1, module: 580, qty: 8, price: 245000, wire: 150, outOfVns: 5000 },
          { kWp: 5.22, phase: 1, module: 580, qty: 9, price: 275000, wire: 150, outOfVns: 5000 },
          { kWp: 5.80, phase: 1, module: 580, qty: 9, price: 305000, wire: 150, outOfVns: 5000 },
        ],
      },
      {
        name: "Three Phase Systems",
        description: "On-grid systems with 580wp TOPCON modules (Three Phase)",
        products: [
          { kWp: 5.04, phase: 3, module: 580, qty: 9, price: 305000, wire: 225, outOfVns: 5000 },
          { kWp: 6.38, phase: 3, module: 580, qty: 11, price: 350000, wire: 225, outOfVns: 5000 },
          { kWp: 8.12, phase: 3, module: 580, qty: 14, price: 430000, wire: 225, outOfVns: 5000 },
          { kWp: 10.44, phase: 3, module: 580, qty: 18, price: 515000, wire: 225, outOfVns: 5000 },
        ],
      },
    ],
  },
  {
    category: "Hybrid DCR Systems",
    supplier: "Waaree/Premier/Emvee TOPCON (580/600wp DCR Hybrid with Battery)",
    variants: [
      {
        name: "With Battery (Lithium 12.8V 100Ah 2Nos)",
        description: "DCR Hybrid systems with battery storage - Full capacity with battery",
        products: [
          { kWp: 2.32, phase: 1, module: 580, qty: 4, price: 221500, wire: 150, outOfVns: 5000 },
          { kWp: 3.00, phase: 1, module: 600, qty: 5, price: 248000, wire: 150, outOfVns: 5000 },
          { kWp: 3.48, phase: 1, module: 580, qty: 6, price: 260000, wire: 150, outOfVns: 5000 },
          { kWp: 4.06, phase: 1, module: 580, qty: 7, price: 305000, wire: 150, outOfVns: 5000 },
          { kWp: 4.64, phase: 1, module: 580, qty: 8, price: 320000, wire: 150, outOfVns: 5000 },
          { kWp: 5.22, phase: 1, module: 580, qty: 9, price: 360000, wire: 150, outOfVns: 5000 },
        ],
      },
      {
        name: "Without Battery",
        description: "DCR Hybrid systems without battery - Reduced cost option",
        products: [
          { kWp: 2.32, phase: 1, module: 580, qty: 4, price: 191500, wire: 150, outOfVns: 5000 },
          { kWp: 3.00, phase: 1, module: 600, qty: 5, price: 212000, wire: 150, outOfVns: 5000 },
          { kWp: 3.48, phase: 1, module: 580, qty: 6, price: 225000, wire: 150, outOfVns: 5000 },
          { kWp: 4.06, phase: 1, module: 580, qty: 7, price: 265000, wire: 150, outOfVns: 5000 },
          { kWp: 4.64, phase: 1, module: 580, qty: 8, price: 280000, wire: 150, outOfVns: 5000 },
          { kWp: 5.22, phase: 1, module: 580, qty: 9, price: 325000, wire: 150, outOfVns: 5000 },
        ],
      },
    ],
  },
  {
    category: "Hybrid N-DCR Systems",
    supplier: "Waaree/Premier/Emvee TOPCON N (580/600wp N-DCR Hybrid)",
    variants: [
      {
        name: "With Battery (Lithium 12.8V 100Ah 2Nos)",
        description: "N-DCR Hybrid systems with battery storage - Premium efficiency",
        products: [
          { kWp: 2.32, phase: 1, module: 580, qty: 4, price: 202940, wire: 150, outOfVns: 5000 },
          { kWp: 3.00, phase: 1, module: 600, qty: 5, price: 224000, wire: 150, outOfVns: 5000 },
          { kWp: 3.48, phase: 1, module: 580, qty: 6, price: 232160, wire: 150, outOfVns: 5000 },
          { kWp: 4.06, phase: 1, module: 580, qty: 7, price: 272520, wire: 150, outOfVns: 5000 },
          { kWp: 4.64, phase: 1, module: 580, qty: 8, price: 282880, wire: 150, outOfVns: 5000 },
          { kWp: 5.22, phase: 1, module: 580, qty: 9, price: 318240, wire: 150, outOfVns: 5000 },
        ],
      },
      {
        name: "Without Battery",
        description: "N-DCR Hybrid systems without battery - Cost-effective N-DCR option",
        products: [
          { kWp: 2.32, phase: 1, module: 580, qty: 4, price: 172940, wire: 150, outOfVns: 5000 },
          { kWp: 3.00, phase: 1, module: 600, qty: 5, price: 188000, wire: 150, outOfVns: 5000 },
          { kWp: 3.48, phase: 1, module: 580, qty: 6, price: 197160, wire: 150, outOfVns: 5000 },
          { kWp: 4.06, phase: 1, module: 580, qty: 7, price: 232520, wire: 150, outOfVns: 5000 },
          { kWp: 4.64, phase: 1, module: 580, qty: 8, price: 242880, wire: 150, outOfVns: 5000 },
          { kWp: 5.22, phase: 1, module: 580, qty: 9, price: 283240, wire: 150, outOfVns: 5000 },
        ],
      },
    ],
  },
];

// Summary statistics
export const productStats = {
  totalProducts: 43,
  categories: 4,
  suppliers: [
    'Tata (560wp)',
    'Waaree/Adani/Premier TOPCON (580/600wp)',
    'Waaree/Premier/Emvee DCR Hybrid (580/600wp)',
    'Waaree/Premier/Emvee N-DCR Hybrid (580/600wp)',
  ],
  priceRange: {
    min: 108974,
    max: 360000,
    currency: '₹',
  },
  modules: {
    '560wp': '5 models in Tata category',
    '580wp': '22 models in TOPCON, DCR & N-DCR categories',
    '600wp': '5 models in TOPCON, DCR & N-DCR categories',
  },
};
