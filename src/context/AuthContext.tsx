
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { useToast } from "@/components/ui/use-toast";

// Simulação de autenticação (em um projeto real, isso seria conectado ao backend)
const mockUsers = [
  {
    id: '1',
    email: 'demo@contentreview.ai',
    password: 'password123',
    plan: 'free' as const,
    usageCount: 45,
    usageLimit: 100,
  },
  {
    id: '2',
    email: 'pro@contentreview.ai',
    password: 'password123',
    plan: 'pro' as const,
    usageCount: 356,
    usageLimit: 1000,
  },
];

const USER_STORAGE_KEY = 'contentReviewUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Improved persistence mechanism
  const saveUserToStorage = (userData: User | null) => {
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log('User saved to localStorage:', userData);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('User removed from localStorage');
    }
  };

  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('User loaded from localStorage:', parsedUser);
        return parsedUser;
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    return null;
  };

  useEffect(() => {
    // Load user from localStorage on initial mount
    const savedUser = loadUserFromStorage();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Omitir senha do objeto de usuário
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        saveUserToStorage(userWithoutPassword);
        
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta, ${email}!`,
          duration: 3000,
        });
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o e-mail já está em uso
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Este e-mail já está em uso');
      }
      
      // Em um app real, isso seria uma chamada ao backend para criar o usuário
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        plan: 'free',
        usageCount: 0,
        usageLimit: 100,
      };
      
      setUser(newUser);
      saveUserToStorage(newUser);
      
      toast({
        title: "Registro bem-sucedido",
        description: `Bem-vindo ao ContentReview.AI, ${email}!`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    saveUserToStorage(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
      duration: 3000,
    });
  };

  const updateUserUsage = (count: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        usageCount: count,
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUserUsage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
