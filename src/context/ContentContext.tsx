
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
  
  const { user, updateUserUsage } = useAuth();
  const { toast } = useToast();

  const analyzeContent = async (text: string): Promise<AnalysisResult | null> => {
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
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Chamada à API externa real
      const response = await fetch('https://content-scribe-analyzer.up.railway.app/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erro na requisição: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Construir o objeto de resultado com os dados retornados pela API
      const result: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        text: text.length > 100 ? `${text.substring(0, 100)}...` : text,
        flagged: data.flagged || false,
        categories: data.categories || [],
        insights: data.insights || ['Nenhum problema encontrado no conteúdo.'],
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
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao analisar conteúdo";
      setError(errorMessage);
      
      toast({
        title: "Erro ao analisar",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Em caso de erro na API, podemos implementar um fallback para os dados mockados
      // ou simplesmente retornar null como estamos fazendo aqui
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
        selectAnalysis
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
