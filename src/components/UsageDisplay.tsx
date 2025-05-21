
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { useAuth } from '../context/AuthContext';

const UsageDisplay = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const { usageCount, usageLimit, plan } = user;
  const usagePercentage = Math.min((usageCount / usageLimit) * 100, 100);
  
  let statusColor = "bg-green-500";
  if (usagePercentage > 90) statusColor = "bg-red-500";
  else if (usagePercentage > 70) statusColor = "bg-yellow-500";
  
  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Uso este mês</h3>
          <p className="text-xs text-gray-500">
            Plano {plan === 'free' ? 'Gratuito' : 'Pro'}
          </p>
        </div>
        <span className="text-sm font-semibold">
          {usageCount} / {usageLimit}
        </span>
      </div>
      
      <Progress value={usagePercentage} className="h-2" />
      
      {usagePercentage > 80 && (
        <p className="mt-2 text-xs text-amber-600">
          {plan === 'free' 
            ? 'Você está próximo do limite. Considere fazer upgrade para o plano Pro.'
            : 'Você está próximo do limite mensal de análises.'}
        </p>
      )}
    </div>
  );
};

export default UsageDisplay;
