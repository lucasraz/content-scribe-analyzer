
import React, { createContext, useContext, useState } from 'react';
import { ContentContextType, AnalysisResult } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from "@/hooks/use-toast";

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number | null>(null);
  
  const { user, updateUserUsage } = useAuth();
  const { toast } = useToast();

  // Função para adicionar um pequeno delay (útil para retry)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const analyzeContent = async (text: string, retries = 0): Promise<AnalysisResult | null> => {
    if (!text.trim()) {
      toast({
        title: "Erro de validação",
        description: "O texto para análise não pode estar vazio.",
        variant: "destructive",
      });
      return null;
    }
    
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para analisar conteúdo.",
        variant: "destructive",
      });
      return null;
    }
    
    if (user.usageCount >= user.usageLimit) {
      toast({
        title: "Limite atingido",
        description: `Você atingiu seu limite de ${user.usageLimit} análises para este mês.`,
        variant: "destructive",
      });
      return null;
    }
    
    // Evitar requisições muito próximas (proteção contra spam)
    const now = Date.now();
    if (lastAnalysisTime && now - lastAnalysisTime < 1000) {
      toast({
        title: "Aguarde um momento",
        description: "Por favor, aguarde alguns segundos entre as análises.",
      });
      return null;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setRetryCount(retries);
    
    try {
      console.log("Enviando requisição para API:", text);
      
      // Chamada à API externa com tratamento de timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout (menor que antes)
      
      const response = await fetch('https://content-scribe-analyzer.up.railway.app/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
        // Adiciona opções para evitar problemas de CORS e cache
        mode: 'cors',
        cache: 'no-cache'
      }).catch(err => {
        console.error("Erro na fetch:", err);
        throw new Error(`Falha na conexão com a API: ${err.message}`);
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("Resposta não-OK da API:", response.status, response.statusText);
        let errorMessage = `Erro na API (${response.status})`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch (e) {
          // Ignorar erro ao tentar parsear resposta já com erro
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json().catch(err => {
        console.error("Erro ao parsear JSON da resposta:", err);
        throw new Error("Formato de resposta inválido");
      });
      
      console.log("Resposta da API:", data);
      setLastAnalysisTime(now);
      
      // Construir o objeto de resultado com os dados retornados pela API
      const result: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        text: text.length > 100 ? `${text.substring(0, 100)}...` : text,
        flagged: data?.flagged || false,
        categories: data?.categories || [],
        insights: data?.insights || ['Nenhum problema encontrado no conteúdo.'],
        timestamp: new Date().toISOString(),
      };
      
      // Atualizar o histórico de análises
      setAnalyses(prev => [result, ...prev]);
      
      // Atualizar a contagem de uso do usuário
      updateUserUsage(user.usageCount + 1);
      
      toast({
        title: "Análise concluída",
        description: "Seu conteúdo foi analisado com sucesso.",
      });
      
      return result;
    } catch (err) {
      console.error("Erro capturado no try/catch:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Erro desconhecido ao analisar conteúdo";
      
      // Implementa lógica de retry com backoff exponencial
      if (retries < 2 && (err.name === 'AbortError' || err.message.includes('Failed to fetch'))) {
        const nextRetry = retries + 1;
        setRetryCount(nextRetry);
        
        toast({
          title: `Tentativa ${nextRetry}/3`,
          description: "Serviço temporariamente indisponível. Tentando reconectar...",
        });
        
        // Espera um tempo crescente entre as retentativas
        const retryDelay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s...
        await delay(retryDelay);
        
        // Tenta novamente
        return analyzeContent(text, nextRetry);
      }
      
      setError(errorMessage);
      
      // Mostrar mensagem de erro mais detalhada
      toast({
        title: "Erro ao analisar",
        description: `${errorMessage}. Por favor, tente novamente mais tarde ou verifique sua conexão.`,
        variant: "destructive",
      });
      
      // Implementar um fallback para análise offline em caso de falha persistente na API
      if (err.name === 'AbortError' || err.message.includes('Failed to fetch')) {
        toast({
          title: "Modo offline ativado",
          description: "Utilizando análise local devido a problemas de conexão.",
        });
        
        // Gerar um resultado simulado para permitir testes mesmo com a API indisponível
        const fallbackResult: AnalysisResult = {
          id: `offline_${Date.now()}`,
          text: text.length > 100 ? `${text.substring(0, 100)}...` : text,
          flagged: text.includes('horrível') || text.includes('péssimo') || text.includes('ruim'),
          categories: ['Análise Local'],
          insights: [
            'Análise realizada em modo offline devido a problemas de conexão.',
            'Recomendamos verificar sua conexão e tentar novamente mais tarde.',
            'Esta análise básica identifica apenas palavras-chave negativas óbvias.'
          ],
          timestamp: new Date().toISOString(),
        };
        
        // Atualizar o histórico de análises com o resultado offline
        setAnalyses(prev => [fallbackResult, ...prev]);
        
        // Atualizar a contagem de uso do usuário (mesmo offline)
        updateUserUsage(user.usageCount + 1);
        
        return fallbackResult;
      }
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectAnalysis = (analysis: AnalysisResult | null) => {
    setSelectedAnalysis(analysis);
  };

  return (
    <ContentContext.Provider 
      value={{ 
        analyses, 
        isAnalyzing, 
        error, 
        analyzeContent,
        selectedAnalysis,
        selectAnalysis,
        retryCount
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
