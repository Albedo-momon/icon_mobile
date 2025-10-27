import {
  User,
  Agent,
  Product,
  Banner,
  Offer,
  CMSResponse,
  HealthCheckResponse,
  ApiResponse,
} from '@icon/config';

// Mock data
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@iconcomputer.com',
    name: 'Admin User',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'customer@example.com',
    name: 'John Customer',
    role: 'CUSTOMER',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'agent@iconcomputer.com',
    name: 'Jane Agent',
    role: 'AGENT',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    email: 'agent2@iconcomputer.com',
    name: 'Alex Agent',
    role: 'AGENT',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// In-memory password store for mock users
export const mockPasswords: Record<string, string> = {
  'admin@iconcomputer.com': 'password123',
  'customer@example.com': 'password123',
  'agent@iconcomputer.com': 'password123',
  'agent2@iconcomputer.com': 'password123',
};

export const mockAgents: Agent[] = [
  {
    id: '1',
    userId: '3',
    shopId: '1',
    user: mockUsers[2],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: '4',
    shopId: '2',
    user: mockUsers[3],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Gaming Laptop Pro',
    description: 'High-performance gaming laptop with RTX 4080',
    price: 1999.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Gaming+Laptop',
    category: 'Laptops',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with RGB lighting',
    price: 79.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Wireless+Mouse',
    category: 'Accessories',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: '4K Monitor',
    description: '27-inch 4K UHD monitor with HDR support',
    price: 399.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=4K+Monitor',
    category: 'Monitors',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches',
    price: 149.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Mechanical+Keyboard',
    category: 'Accessories',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockBanners: Banner[] = [
  {
    id: '1',
    title: 'Summer Sale 2024',
    description: 'Up to 50% off on selected items',
    imageUrl: 'https://via.placeholder.com/800x300?text=Summer+Sale+2024',
    linkUrl: '/products?sale=true',
    isActive: true,
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'New Gaming Collection',
    description: 'Discover our latest gaming hardware',
    imageUrl: 'https://via.placeholder.com/800x300?text=Gaming+Collection',
    linkUrl: '/products?category=gaming',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockOffers: Offer[] = [
  {
    id: '1',
    title: 'Student Discount',
    description: '15% off for students with valid ID',
    discountPercentage: 15,
    isActive: true,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Bundle Deal',
    description: '20% off when you buy 3 or more items',
    discountPercentage: 20,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock API responses
export const mockHealthResponse: HealthCheckResponse = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  database: 'connected',
  version: '1.0.0',
};

export const mockCMSResponse: CMSResponse = {
  title: 'Welcome to Icon Computer',
  content: 'Your trusted computer service and repair network. We provide professional computer services, repairs, and sales across multiple locations.',
  banners: mockBanners,
  offers: mockOffers,
  products: mockProducts,
};

// Mock API delay simulation
export const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock error responses
export const mockErrors = {
  networkError: {
    success: false,
    error: 'Network connection failed',
  },
  serverError: {
    success: false,
    error: 'Internal server error',
  },
  notFound: {
    success: false,
    error: 'Resource not found',
  },
  unauthorized: {
    success: false,
    error: 'Unauthorized access',
  },
};