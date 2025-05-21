
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MainNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6">
        <Logo />

        {user && (
          <nav className="ml-8 hidden md:flex flex-1 items-center space-x-4 lg:space-x-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-primary ${
                  isActive ? 'text-brand-primary' : 'text-gray-700'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-primary ${
                  isActive ? 'text-brand-primary' : 'text-gray-700'
                }`
              }
            >
              Histórico
            </NavLink>
            <NavLink
              to="/plans"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-primary ${
                  isActive ? 'text-brand-primary' : 'text-gray-700'
                }`
              }
            >
              Planos
            </NavLink>
          </nav>
        )}

        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center cursor-pointer text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainNav;
