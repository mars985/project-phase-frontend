import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  preview: string;
}

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const activeChat = chats.find(c => c.id === activeChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New chat',
      messages: [],
      preview: 'Start a conversation'
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    let targetChatId = activeChatId;

    if (!targetChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: 'New chat',
        messages: [],
        preview: ''
      };
      setChats(prev => [newChat, ...prev]);
      targetChatId = newChat.id;
      setActiveChatId(newChat.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'This is a demo response. In a real application, this would be connected to an AI API.'
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === targetChatId) {
        const newMessages = [...chat.messages, userMessage, assistantMessage];
        return {
          ...chat,
          messages: newMessages,
          title: chat.messages.length === 0 ? inputValue.slice(0, 40) : chat.title,
          preview: inputValue.slice(0, 60)
        };
      }
      return chat;
    }));

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[280px] border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3">
          <Button 
            onClick={createNewChat}
            variant="outline"
            className="w-full justify-start gap-2 h-10 border-gray-300 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            New chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                  activeChatId === chat.id
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900 truncate mb-0.5">
                  {chat.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {chat.preview}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto w-full px-4 py-8">
            {activeChat && activeChat.messages.length > 0 ? (
              <div className="space-y-6">
                {activeChat.messages.map(message => (
                  <div key={message.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Bot className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {message.role === 'user' ? 'You' : 'Image Generation'}
                      </div>
                      <div className="text-gray-800 leading-7 whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-2">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-500">
                    Start a conversation by typing a message below
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto w-full p-4">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send the Prompt..."
                className="min-h-[60px] max-h-[200px] resize-none pr-12 text-base"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                size="icon"
                className="absolute right-3 bottom-3 h-8 w-8 rounded-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}