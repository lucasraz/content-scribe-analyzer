
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const USER_STORAGE_KEY = 'contentReviewUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Function to map Supabase user data to our User type
  const mapSupabaseUserToUser = (supabaseUser: any, userData?: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      plan: userData?.plan || 'free',
      usageCount: userData?.usageCount || 0,
      usageLimit: userData?.usageLimit || 100,
    };
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          const mappedUser = mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('Existing session found:', session);
        const mappedUser = mapSupabaseUserToUser(session.user);
        setUser(mappedUser);
      } else {
        console.log('No session found');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        throw new Error('E-mail e senha são obrigatórios');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const mappedUser = mapSupabaseUserToUser(data.user);
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
      if (!email || !password) {
        throw new Error('E-mail e senha são obrigatórios');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan: 'free',
            usageCount: 0,
            usageLimit: 100
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const mappedUser = mapSupabaseUserToUser(data.user, {
          plan: 'free',
          usageCount: 0,
          usageLimit: 100
        });
        
        toast({
          title: "Registro bem-sucedido",
          description: `Bem-vindo ao ContentReview.AI, ${email}! Verifique seu email para confirmar sua conta.`,
          duration: 5000,
        });
      } else {
        throw new Error('Erro ao criar conta');
      }
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const updateUserUsage = (count: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        usageCount: count,
      };
      setUser(updatedUser);
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
