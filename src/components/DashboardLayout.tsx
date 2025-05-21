
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainNav from './MainNav';

const DashboardLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Mostra loader enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow text-brand-primary">
          Carregando...
        </div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ContentReview.AI - Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
