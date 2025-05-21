
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { z } from 'zod';

// These types match the form schemas in the respective form components
type LoginFormValues = {
  email: string;
  password: string;
};

type RegisterFormValues = LoginFormValues & {
  confirmPassword: string;
};

interface LoginCardProps {
  defaultTab?: string;
  onTabChange: (value: string) => void;
  onLoginSubmit: (data: LoginFormValues) => Promise<void>;
  onRegisterSubmit: (data: RegisterFormValues) => Promise<void>;
  isSubmitting: boolean;
  loginError?: string | null;
  registerError?: string | null;
}

const LoginCard = ({
  defaultTab = "login",
  onTabChange,
  onLoginSubmit,
  onRegisterSubmit,
  isSubmitting,
  loginError,
  registerError,
}: LoginCardProps) => {
  return (
    <Card className="w-full bg-white/95 backdrop-blur shadow-xl">
      <CardHeader>
        <Tabs defaultValue={defaultTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>
        
          <TabsContent value="login" className="mt-4">
            <LoginForm 
              onSubmit={onLoginSubmit} 
              isSubmitting={isSubmitting}
              loginError={loginError}
            />
            <div className="mt-4">
              <p className="text-sm text-center text-gray-500">
                Para testar, use: demo@contentreview.ai / password123
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="register" className="mt-4">
            <RegisterForm 
              onSubmit={onRegisterSubmit} 
              isSubmitting={isSubmitting}
              registerError={registerError}
            />
          </TabsContent>
        </Tabs>
      </CardHeader>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-gray-500">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
