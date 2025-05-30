
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import UsageDisplay from '../components/UsageDisplay';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const DashboardPage: React.FC = () => {
  const [text, setText] = useState('');
  const { user } = useAuth();
  const { analyzeContent, isAnalyzing, selectedAnalysis, selectAnalysis, error, retryCount, generateReport } = useContent();
  const { toast } = useToast();

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

  const handleGenerateReport = () => {
    if (!selectedAnalysis) return;
    
    if (user?.plan !== 'pro') {
      toast({
        title: "Funcionalidade Premium",
        description: "A geração de relatórios está disponível apenas para o plano Pro.",
        variant: "destructive",
      });
      return;
    }
    
    const report = generateReport(selectedAnalysis);
    
    // Create a blob and download it
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-contentreview-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório gerado",
      description: "O relatório foi baixado com sucesso.",
    });
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
                    {retryCount > 0 ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Reconectando ({retryCount}/3)...
                      </>
                    ) : (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    )}
                  </>
                ) : "Analisar Conteúdo"}
              </Button>
            </CardFooter>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Problema de conexão</AlertTitle>
              <AlertDescription>
                Não foi possível conectar ao serviço de análise. 
                O sistema está utilizando análise local para continuar funcionando.
              </AlertDescription>
            </Alert>
          )}

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
                  {selectedAnalysis.id.startsWith('offline_') && (
                    <span className="ml-2 text-amber-600 text-xs">
                      (análise offline)
                    </span>
                  )}
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
                
                {/* Nova seção de sugestões */}
                {selectedAnalysis.suggestions && selectedAnalysis.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Sugestões de Melhoria:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button 
                    onClick={handleGenerateReport}
                    variant={user?.plan === 'pro' ? 'default' : 'outline'}
                    className={user?.plan !== 'pro' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : ''}
                    disabled={user?.plan !== 'pro'}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {user?.plan === 'pro' ? 'Gerar Relatório' : 'Exclusivo para Plano Pro'}
                  </Button>
                  {user?.plan !== 'pro' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Faça upgrade para o plano Pro para acessar esta funcionalidade.
                    </p>
                  )}
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
              
              {/* Nova seção de recursos pro */}
              <div className="text-sm mt-2 p-3 bg-amber-50 rounded-md border border-amber-100">
                <p className="font-medium text-amber-800">Recursos exclusivos do plano Pro:</p>
                <ul className="list-disc pl-5 space-y-1 text-amber-700 mt-1">
                  <li>Geração de relatórios completos</li>
                  <li>Sugestões avançadas de melhoria de texto</li>
                  <li>Prioridade no atendimento</li>
                  <li>1.000 análises mensais</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
