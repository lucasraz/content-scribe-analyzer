
import React from 'react';
import { useContent } from '../context/ContentContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HistoryPage: React.FC = () => {
  const { analyses, selectAnalysis, selectedAnalysis } = useContent();

  const handleSelect = (analysisId: string) => {
    const analysis = analyses.find(a => a.id === analysisId);
    if (analysis) {
      selectAnalysis(analysis);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">
          Visualize suas análises anteriores.
        </p>
      </div>

      <Card>
        {analyses.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Categorias</TableHead>
                  <TableHead className="w-[160px]">Data</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis) => (
                  <TableRow 
                    key={analysis.id}
                    className={selectedAnalysis?.id === analysis.id ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Badge variant={analysis.flagged ? "destructive" : "outline"}>
                        {analysis.flagged ? "Flagged" : "Seguro"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {analysis.text}
                    </TableCell>
                    <TableCell>
                      {analysis.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {analysis.categories.map((category, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nenhuma</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(analysis.timestamp), { 
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSelect(analysis.id)}
                      >
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium">Nenhuma análise encontrada</h3>
            <p className="text-muted-foreground mt-1">
              Vá para o dashboard e analise algum conteúdo para ver o histórico aqui.
            </p>
          </div>
        )}
      </Card>
      
      {selectedAnalysis && (
        <Card className={`shadow-sm border-l-4 ${selectedAnalysis.flagged ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalhes da Análise</h3>
              <Badge variant={selectedAnalysis.flagged ? "destructive" : "outline"}>
                {selectedAnalysis.flagged ? "Conteúdo Flagged" : "Conteúdo Seguro"}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Conteúdo Analisado:</h4>
                <p className="mt-1 p-3 bg-gray-50 rounded-md border text-sm">{selectedAnalysis.text}</p>
              </div>
              
              {selectedAnalysis.categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Categorias Identificadas:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAnalysis.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Insights:</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {selectedAnalysis.insights.map((insight, index) => (
                    <li key={index} className="text-sm">{insight}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium text-gray-500">Data e Hora:</h4>
                <p className="text-sm mt-1">
                  {new Date(selectedAnalysis.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HistoryPage;
