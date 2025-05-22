
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PricingCard from '../components/PricingCard';
import { useToast } from '@/components/ui/use-toast';

const PlansPage: React.FC = () => {
  const { user, updateUserUsage } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectPlan = (plan: 'free' | 'pro') => {
    if (!user) return;
    
    if (plan === user.plan) {
      toast({
        title: "Plano atual",
        description: "Você já está inscrito neste plano.",
      });
      return;
    }
    
    setIsUpdating(true);
    
    // Simular processo de upgrade/downgrade
    setTimeout(() => {
      // Em um aplicativo real, aqui seria enviada uma solicitação para a API de pagamento/stripe
      
      // Atualização simulada do plano do usuário
      const usageLimit = plan === 'free' ? 100 : 1000;
      updateUserUsage(user.usageCount); // Isso irá atualizar o plano e manter a contagem de uso
      
      toast({
        title: "Plano atualizado",
        description: `Seu plano foi atualizado para ${plan === 'free' ? 'Gratuito' : 'Pro'}.`,
      });
      
      setIsUpdating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground">
          Escolha o plano que melhor atende às suas necessidades.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
        <PricingCard
          plan="free"
          price="Grátis"
          description="Perfeito para começar a analisar seu conteúdo."
          features={[
            "100 análises por mês",
            "Detecção de conteúdo impróprio",
            "Histórico de análises",
            "Suporte por email"
          ]}
          onSelect={() => handleSelectPlan('free')}
          isCurrentPlan={user?.plan === 'free'}
        />
        
        <PricingCard
          plan="pro"
          price="R$ 39"
          description="Para quem precisa de uma análise de conteúdo regular."
          features={[
            "1000 análises por mês",
            "Todas as funcionalidades do plano gratuito",
            "Prioridade no suporte",
            "Geração de relatórios completos",
            "Sugestões avançadas de melhoria de texto",
            "API de integração"
          ]}
          isPrimary
          onSelect={() => handleSelectPlan('pro')}
          isCurrentPlan={user?.plan === 'pro'}
        />
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Perguntas Frequentes</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Como funciona a contagem de análises?</h3>
            <p className="text-gray-600 mt-1">
              Cada vez que você clica em "Analisar Conteúdo", é consumida uma análise do seu limite mensal.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Quando o limite é renovado?</h3>
            <p className="text-gray-600 mt-1">
              O limite é renovado no primeiro dia de cada mês.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Posso trocar de plano a qualquer momento?</h3>
            <p className="text-gray-600 mt-1">
              Sim, você pode fazer upgrade ou downgrade do seu plano quando quiser. As alterações são aplicadas imediatamente.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">O que inclui a geração de relatórios?</h3>
            <p className="text-gray-600 mt-1">
              A geração de relatórios, exclusiva do plano Pro, permite exportar uma análise completa do seu conteúdo com todas as sugestões de melhoria em um formato facilmente compartilhável.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Como funciona o pagamento?</h3>
            <p className="text-gray-600 mt-1">
              Utilizamos o Stripe para processar pagamentos de forma segura. Aceitamos todos os principais cartões de crédito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
