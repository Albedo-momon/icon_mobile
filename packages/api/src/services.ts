import { apiClient } from './client';
import { config, buildApiUrl } from '@icon/config';
import {
  HealthCheckResponse,
  CMSResponse,
  ApiResponse,
  User,
  LoginForm,
  RegisterForm,
} from '@icon/config';
import {
  mockHealthResponse,
  mockCMSResponse,
  mockUsers,
  mockPasswords,
  mockDelay,
  mockErrors,
} from './mock';

// Health service
export const healthService = {
  async checkHealth(): Promise<HealthCheckResponse> {
    if (config.mockMode) {
      await mockDelay();
      return mockHealthResponse;
    }
    
    return apiClient.get<HealthCheckResponse>(buildApiUrl('health'));
  },
};

// CMS service
export const cmsService = {
  async getCMSData(): Promise<CMSResponse> {
    // In mock mode, enrich with real dummy images from public APIs
    if (config.mockMode) {
      await mockDelay();
      try {
        // Fetch banner images from Picsum and product data with images from DummyJSON
        const [picsumList, dummyProducts, dummyLaptopProducts] = await Promise.all([
          fetch('https://picsum.photos/v2/list?limit=5').then((r) => r.json()),
          fetch('https://dummyjson.com/products?limit=30').then((r) => r.json()),
          fetch('https://dummyjson.com/products/category/laptops?limit=10').then((r) => r.json()),
        ]);

        const nowIso = new Date().toISOString();

        const banners = (picsumList || []).slice(0, 3).map((b: any, idx: number) => ({
          id: String(b.id ?? idx + 1),
          title: ['SALE', 'New Arrivals', 'Top Deals'][idx] ?? `Banner ${idx + 1}`,
          description: undefined,
          imageUrl: `https://picsum.photos/id/${b.id}/${1200}/${600}`,
          linkUrl: undefined,
          isActive: true,
          startDate: undefined,
          endDate: undefined,
          createdAt: nowIso,
          updatedAt: nowIso,
        }));

        const productsMain = (dummyProducts?.products || []).map((p: any) => ({
          id: String(p.id),
          name: p.title,
          description: p.description,
          price: Number(p.price),
          imageUrl: p.thumbnail || (Array.isArray(p.images) && p.images[0]) || `https://picsum.photos/seed/${p.id}/600/400`,
          category: p.category || 'general',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        }));

        const productsLaptops = (dummyLaptopProducts?.products || []).map((p: any) => ({
          id: String(p.id),
          name: p.title,
          description: p.description,
          price: Number(p.price),
          imageUrl: p.thumbnail || (Array.isArray(p.images) && p.images[0]) || `https://picsum.photos/seed/${p.id}/600/400`,
          category: p.category || 'laptops',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        }));

        // Merge and deduplicate products, ensuring laptop category is present
        const productsMap: Record<string, any> = {};
        [...productsMain, ...productsLaptops].forEach((prod) => {
          productsMap[prod.id] = prod;
        });
        const products = Object.values(productsMap);

        const topDiscounts = ([...(dummyProducts?.products || []), ...(dummyLaptopProducts?.products || [])])
          .slice()
          .sort((a: any, b: any) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0))
          .slice(0, 3);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14);
        const endIso = endDate.toISOString();

        const offers = topDiscounts.map((p: any) => ({
          id: `offer-${p.id}`,
          title: `${p.title} — ${p.discountPercentage}% OFF`,
          description: `Save ${p.discountPercentage}% on ${p.title}`,
          discountPercentage: Number(p.discountPercentage ?? 10),
          isActive: true,
          startDate: nowIso,
          endDate: endIso,
          createdAt: nowIso,
          updatedAt: nowIso,
        }));

        return {
          title: 'ShopApp',
          content: 'Dynamic content powered by DummyJSON and Picsum.',
          banners,
          offers,
          products,
        };
      } catch (e) {
        console.warn('[CMS] Failed to load dummy images, falling back to mockCMSResponse:', e);
        return mockCMSResponse;
      }
    }

    // Real API mode
    return apiClient.get<CMSResponse>(buildApiUrl('cms'));
  },

  async getHomeContent(): Promise<ApiResponse<any>> {
    if (config.mockMode) {
      await mockDelay();
      return {
        success: true,
        data: {
          title: 'Welcome to Icon Computer',
          content: 'Your trusted computer service and repair network. We provide professional computer services, repairs, and sales across multiple locations.',
          hero: {
            title: 'Welcome to Icon Mobile',
            subtitle: 'Your trusted mobile shopping companion',
            image: 'https://via.placeholder.com/400x200',
          },
          featuredProducts: [
            { id: '1', name: 'iPhone 15 Pro', price: 999, image: 'https://via.placeholder.com/150' },
            { id: '2', name: 'Samsung Galaxy S24', price: 899, image: 'https://via.placeholder.com/150' },
            { id: '3', name: 'Google Pixel 8', price: 699, image: 'https://via.placeholder.com/150' },
          ],
          announcements: [
            { id: '1', title: 'New Year Sale', message: 'Up to 50% off on selected items!' },
            { id: '2', title: 'Free Shipping', message: 'Free shipping on orders over $100' },
          ],
        },
      };
    }
    
    return apiClient.get<ApiResponse<any>>(buildApiUrl('cms') + '/home');
  },
};

// Auth service
export const authService = {
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    if (config.mockMode) {
      await mockDelay();
      
      // Mock login validation using stored passwords
      const user = mockUsers.find(u => u.email === credentials.email);
      const expectedPassword = user ? mockPasswords[user.email] : undefined;
      if (!user || !expectedPassword || credentials.password !== expectedPassword) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
      
      return {
        success: true,
        data: {
          user,
          token: 'mock-jwt-token-' + user.id,
        },
      };
    }
    
    return apiClient.post<ApiResponse<{ user: User; token: string }>>(
      buildApiUrl('auth') + '/login',
      credentials
    );
  },

  async register(form: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    // Try real backend route first (which proxies to Clerk), then gracefully fall back to mock.
    try {
      return await apiClient.post<ApiResponse<{ user: User; token: string }>>(
        buildApiUrl('auth') + '/register',
        form
      );
    } catch (e) {
      // If in mock mode, provide a local mock fallback; otherwise rethrow error
      if (!config.mockMode) {
        throw e;
      }

      await mockDelay();
      const existingUser = mockUsers.find(u => u.email === form.email);
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        email: form.email,
        name: form.name,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      mockPasswords[newUser.email] = form.password;
      return { success: true, data: { user: newUser, token: 'mock-jwt-token-' + newUser.id } };
    }
  },

  async logout(): Promise<ApiResponse> {
    if (config.mockMode) {
      await mockDelay();
      return { success: true };
    }
    
    return apiClient.post<ApiResponse>(buildApiUrl('auth') + '/logout');
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (config.mockMode) {
      await mockDelay();
      // Return first user as current user for mock
      return {
        success: true,
        data: mockUsers[0],
      };
    }
    
    return apiClient.get<ApiResponse<User>>(buildApiUrl('auth') + '/me');
  },
};

// User service
export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    if (config.mockMode) {
      await mockDelay();
      return {
        success: true,
        data: mockUsers,
      };
    }
    
    return apiClient.get<ApiResponse<User[]>>(buildApiUrl('users'));
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    if (config.mockMode) {
      await mockDelay();
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        return mockErrors.notFound as ApiResponse<User>;
      }
      return {
        success: true,
        data: user,
      };
    }
    
    return apiClient.get<ApiResponse<User>>(`${buildApiUrl('users')}/${id}`);
  },
};

// Agent service
export const agentService = {
  async getCurrentAgent(): Promise<ApiResponse<any>> {
    if (config.mockMode) {
      await mockDelay();
      return {
        success: true,
        data: {
          id: 'agent-001',
          name: 'Admin',
          email: 'happy@adminuiux.com',
          phone: '+91 9856225A588',
          status: 'active',
          joinDate: '2024-01-15',
          totalSales: 15420.50,
          commission: 2313.08,
          rating: 4.8,
          completedOrders: 142,
          avatarUrl: 'https://i.pravatar.cc/150?img=47',
        },
      };
    }
    
    return apiClient.get<ApiResponse<any>>(buildApiUrl('agents') + '/current');
  },

  async getAgentDashboard(): Promise<ApiResponse<any>> {
    if (config.mockMode) {
      await mockDelay();
      return {
        success: true,
        data: {
          totalSales: 15420.50,
          todaySales: 1250.00,
          pendingOrders: 8,
          completedOrders: 142,
          recentActivity: [
            { id: '1', action: 'Order completed', time: '2 hours ago' },
            { id: '2', action: 'New customer registered', time: '4 hours ago' },
            { id: '3', action: 'Product inquiry', time: '6 hours ago' },
          ],
        },
      };
    }
    
    return apiClient.get<ApiResponse<any>>(buildApiUrl('agents') + '/dashboard');
  },
};

// Export all services
export const api = {
  health: healthService,
  cms: cmsService,
  auth: authService,
  user: userService,
  agent: agentService,
};

export default api;