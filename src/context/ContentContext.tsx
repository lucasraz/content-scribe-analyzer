
import React, { createContext, useContext, useState } from 'react';
import { ContentContextType, AnalysisResult } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Mock de resultados de análise para demonstração
const mockAnalysisResponse = (text: string): AnalysisResult => {
  // Em um app real, isso viria da API externa
  const isFlagged = text.toLowerCase().includes('spam') || 
                    text.toLowerCase().includes('hack') || 
                    Math.random() > 0.7;
  
  const possibleCategories = [
    'Conteúdo Comercial', 
    'Potencial Spam', 
    'Linguagem Imprópria', 
    'Conteúdo Sensível', 
    'Potencial Phishing',
    'Discurso de Ódio',
    'Desinformação'
  ];
  
  const possibleInsights = [
    'O texto contém elementos comumente encontrados em mensagens comerciais não solicitadas.',
    'Foram detectados padrões linguísticos associados a tentativas de engenharia social.',
    'O conteúdo pode violar políticas de uso de várias plataformas.',
    'Recomenda-se revisão manual devido à presença de elementos de risco médio.',
    'O texto apresenta características de comunicação manipulativa.',
    'Detectamos uso excessivo de urgência e pressão psicológica no conteúdo.',
    'O texto possui similaridade com padrões de phishing conhecidos.'
  ];
  
  // Selecionar aleatoriamente de 0 a 3 categorias
  const selectedCategories = isFlagged 
    ? possibleCategories
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1) 
    : [];
  
  // Selecionar aleatoriamente de 1 a 3 insights
  const selectedInsights = possibleInsights
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + (isFlagged ? 1 : 0));
  
  return {
    id: `analysis_${Date.now()}`,
    text: text.length > 100 ? `${text.substring(0, 100)}...` : text,
    flagged: isFlagged,
    categories: selectedCategories,
    insights: isFlagged ? selectedInsights : ['Nenhum problema encontrado no conteúdo.'],
    timestamp: new Date().toISOString(),
  };
};

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
      // Em um aplicativo real, isso seria uma chamada à API externa
      // const response = await fetch('https://seu-projeto.up.railway.app/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text }),
      // });
      
      // if (!response.ok) throw new Error('Falha ao analisar o conteúdo');
      // const data = await response.json();
      
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Usando dados simulados para demonstração
      const result = mockAnalysisResponse(text);
      
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
