// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'AGENT';
  createdAt: string;
  updatedAt: string;
}

// Shop types
export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  operatingHours: string;
  createdAt: string;
  updatedAt: string;
}

// Agent types
export interface Agent {
  id: string;
  userId: string;
  shopId: string;
  user?: User;
  shop?: Shop;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Banner types
export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Offer types
export interface Offer {
  id: string;
  title: string;
  description?: string;
  discountPercentage: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// CMS Response types
export interface CMSResponse {
  title: string;
  content: string;
  banners: Banner[];
  offers: Offer[];
  products: Product[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Health Check types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
  version: string;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Products: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Login: undefined;
  Register: undefined;
  RegisterSuccess: undefined;
  AddMobile: undefined;
  AgentHub: undefined;
  AgentStatus: { requestId?: string; serviceType?: 'IN_HOUSE' | 'IN_SHOP' | 'PC_BUILD'; category?: string; issueTitle?: string; issueNotes?: string } | undefined;
  AgentRequest: undefined;
  AgentHistory: undefined;
  Services: undefined;
};

export type ServiceType = 'IN_HOUSE' | 'IN_SHOP' | 'PC_BUILD';

export type AgentStackParamList = {
  Dashboard: undefined;
  Settings: undefined;
  Profile: undefined;
  Requests: undefined;
  RequestDetail: { requestId: string; serviceType: ServiceType; title?: string; customerName?: string; issueType?: string; issueDescription?: string; clientAddress?: string; clientPhone?: string; clientEmail?: string; nextVisitAt?: string; status?: 'NEW'|'ACCEPTED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED' };
  ServiceFlow: { requestId: string; serviceType: ServiceType; etaMinutes?: number };
  Timeline: { requestId: string; events?: any[] };
};

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}