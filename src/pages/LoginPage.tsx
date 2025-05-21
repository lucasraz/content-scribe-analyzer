
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import LoginBackground from '../components/LoginBackground';
import LoginCard from '../components/auth/LoginCard';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  const { login, register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Reset errors when tab changes
  useEffect(() => {
    setLoginError(null);
    setRegisterError(null);
  }, [activeTab]);

  const handleLoginSubmit = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      await login(data.email, data.password);
      // Navigation happens in useEffect when user state changes
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    setRegisterError(null);
    
    try {
      await registerUser(data.email, data.password);
      // Navigation happens in useEffect when user state changes
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error instanceof Error ? error.message : "Erro ao criar conta. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <LoginBackground />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Logo size="lg" />
          <h2 className="text-2xl font-medium text-center text-gray-800">
            Bem-vindo ao ContentReview.AI
          </h2>
          <p className="text-sm text-center text-gray-700 max-w-sm">
            A ferramenta de análise de conteúdo que protege sua presença online.
          </p>
        </div>

        <LoginCard
          defaultTab={activeTab}
          onTabChange={setActiveTab}
          onLoginSubmit={handleLoginSubmit}
          onRegisterSubmit={handleRegisterSubmit}
          isSubmitting={isSubmitting}
          loginError={loginError}
          registerError={registerError}
        />
      </div>
    </div>
  );
};

export default LoginPage;
