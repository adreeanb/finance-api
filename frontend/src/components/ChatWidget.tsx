import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { api } from '../services/api'; // 👈 Importando a instância configurada do Axios

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Olá! Como posso ajudar com suas finanças hoje?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rola o chat para baixo automaticamente quando chega nova mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Adiciona mensagem do usuário na tela
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user' }]);
    setIsLoading(true);

    try {
      // Usando o Axios (`api`), ele já injeta a baseURL e o Token JWT automaticamente!
      const response = await api.post('/chat/process', {
        message: userText,
        // Opcional: O userId pode ser pego direto pelo token no backend, mas mantive se sua rota exigir
      });

      const data = response.data;

      if (data.sucesso && data.resposta) {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          text: data.resposta, 
          sender: 'bot' 
        }]);
      } else if (!data.ignorado) {
        throw new Error('Falha ao processar');
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        text: '⚠️ Desculpe, não consegui me conectar ao servidor no momento.', 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed sm:absolute inset-0 sm:inset-auto sm:bottom-16 sm:right-0 w-full sm:w-96 bg-white sm:rounded-2xl shadow-2xl sm:border sm:border-gray-200 overflow-hidden flex flex-col h-[100dvh] sm:h-[500px] max-h-[100dvh] sm:max-h-[80vh] transition-all duration-300 z-[60]">
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Assistente Financeiro</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-emerald-700 p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`max-w-[85%] p-3 text-sm rounded-xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-emerald-600 text-white self-end rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 self-start rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white text-gray-400 border border-gray-100 p-3 text-sm rounded-xl self-start rounded-tl-none flex gap-1 items-center shadow-sm">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite seu gasto ou pergunte algo..."
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg px-4 py-2 text-sm outline-none transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} 
          absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}