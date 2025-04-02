import React, { useRef, useState } from 'react';
import { Upload, FileText, Search, Database, Brain, Settings, Layout } from 'lucide-react';
import axios from 'axios';

interface AnalysisResult {
  content: string;
  confidence: number;
  type: string;
}

interface SearchResult {
  content: string;
  metadata: {
    filename: string;
    type: string;
    size: number;
    timestamp: string;
  };
  similarity_score: number;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setAnalyzing(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', files[0]);

      try {
        const response = await axios.post('http://localhost:8000/api/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setResults(response.data.results);
      } catch (err) {
        setError('Falha ao analisar o documento. Por favor, tente novamente.');
        console.error('Erro ao analisar documento:', err);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await axios.post('http://localhost:8000/api/search', {
        query: searchQuery,
        limit: 5
      });
      setSearchResults(response.data.results);
    } catch (err) {
      setError('Falha ao buscar documentos similares.');
      console.error('Erro na busca:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-white text-xl font-semibold">DocAnalytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <Settings className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Seção de Upload */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-600/50 transition-all" onClick={handleUploadClick}>
       
            {analyzing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Processando documento...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mb-4 text-blue-500" />
                <p className="mb-2 text-xl text-gray-300 text-center">
                  <span className="font-semibold">Arraste e solte</span> seu arquivo aqui<br />
                  ou clique para selecionar
                </p>
                <p className="text-sm text-gray-400">Formatos suportados: PDF, PNG, JPG</p>
                {file && (
                  <p className="mt-3 text-sm text-blue-400 font-medium">
                    {file.name}
                  </p>
                )}
              </>
            )}
          <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={analyzing}
            />
          </div>
        </div>

        {/* Seção de Busca */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busque por documentos similares..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Seção de Resultados - Agora abaixo do upload */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Resultados da Análise
            </h2>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 mx-6 mt-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="p-6 space-y-6">
            {results.length > 0 ? (
              results.map((result, index) => (
                <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-center bg-gray-700/50 px-4 py-3 border-b border-gray-700">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      result.type === 'extracted_text' 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-purple-900/50 text-purple-300'
                    }`}>
                      {result.type === 'extracted_text' ? 'Texto Extraído' : 'Análise AI'}
                    </span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-2">Confiança:</span>
                      <span className="text-sm font-medium text-blue-400">
                        {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm leading-6">
                      {result.content}
                    </pre>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="h-10 w-10 mb-4" />
                <p>Nenhum resultado disponível</p>
                <p className="text-sm mt-1">Envie um documento para ver a análise</p>
              </div>
            )}
          </div>
        </div>

        {/* Resultados da Busca */}
        {searchResults.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-500" />
                Documentos Similares
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-green-500 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-300">
                      {result.metadata.filename}
                    </span>
                    <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full">
                      Similaridade: {(result.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{result.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3 hover:border-purple-500 transition-colors">
            <Brain className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-white font-medium">Análise AI</h3>
              <p className="text-gray-400 text-sm">Extração inteligente de conteúdo</p>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3 hover:border-green-500 transition-colors">
            <Database className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-white font-medium">Banco Vetorial</h3>
              <p className="text-gray-400 text-sm">Busca semântica</p>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3 hover:border-blue-500 transition-colors">
            <Layout className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-white font-medium">OCR</h3>
              <p className="text-gray-400 text-sm">Reconhecimento de texto</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;