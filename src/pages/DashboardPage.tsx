
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import UsageDisplay from '../components/UsageDisplay';

const DashboardPage: React.FC = () => {
  const [text, setText] = useState('');
  const { user } = useAuth();
  const { analyzeContent, isAnalyzing, selectedAnalysis, selectAnalysis } = useContent();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    const result = await analyzeContent(text);
    if (result) {
      selectAnalysis(result);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const canAnalyze = user && user.usageCount < user.usageLimit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Analise seu conteúdo para identificar potenciais problemas.
          </p>
        </div>
        <UsageDisplay />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Analisar Conteúdo</CardTitle>
              <CardDescription>
                Cole o texto que deseja analisar no campo abaixo e clique em "Analisar".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Cole aqui o conteúdo para análise..."
                className="min-h-[200px]"
                value={text}
                onChange={handleTextChange}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                {user && `${user.usageCount} de ${user.usageLimit} análises utilizadas`}
              </p>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !canAnalyze || !text.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : "Analisar Conteúdo"}
              </Button>
            </CardFooter>
          </Card>

          {selectedAnalysis && (
            <Card className={`shadow-sm border-l-4 ${selectedAnalysis.flagged ? 'border-l-red-500' : 'border-l-green-500'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resultado da Análise</CardTitle>
                  <Badge variant={selectedAnalysis.flagged ? "destructive" : "outline"}>
                    {selectedAnalysis.flagged ? "Conteúdo Flagged" : "Conteúdo Seguro"}
                  </Badge>
                </div>
                <CardDescription>
                  {new Date(selectedAnalysis.timestamp).toLocaleString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAnalysis.categories.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Categorias Identificadas:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnalysis.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">Insights:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedAnalysis.insights.map((insight, index) => (
                      <li key={index} className="text-sm">{insight}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Dicas de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">O que você pode analisar:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>E-mails antes de enviar</li>
                  <li>Postagens para redes sociais</li>
                  <li>Textos para seu site ou blog</li>
                  <li>Mensagens de marketing</li>
                  <li>Conteúdo de terceiros</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Por que usar nossa análise:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Evite problemas de compliance</li>
                  <li>Proteja sua reputação online</li>
                  <li>Garanta conformidade com políticas</li>
                  <li>Evite conteúdo problemático</li>
                </ul>
              </div>
              
              <div className="text-sm mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="font-medium text-blue-800">Precisa de mais análises?</p>
                <p className="text-blue-700 mt-1">
                  Faça upgrade para o plano Pro e obtenha 1.000 análises por mês.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
