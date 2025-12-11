import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Send, User, Bot, Loader2 } from "lucide-react";

interface Message {
  _id: string;
  prompt: string;
  image?: {
    data: {
      type: string;
      data: number[];
    };
    contentType: string;
  };
}

interface Chat {
  _id: string;
  prompt: string | null;
  prompts?: Message[];
}

const API_BASE_URL = "http://localhost:3000";

export default function ClaudeInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Fetch all conversations on mount
  useEffect(() => {
    fetchAllConversations();
  }, []);

  // Fetch full conversation when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchConversationById(activeChatId);
    }
  }, [activeChatId]);

  const fetchAllConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/allConversations`);
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchConversationById = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${id}`);
      const data = await response.json();
      setActiveChat(data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/createConversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const newChat = await response.json();
      setChats((prev) => [
        { _id: newChat._id, prompt: null, prompts: [] },
        ...prev,
      ]);
      setActiveChatId(newChat._id);
      setActiveChat({ _id: newChat._id, prompt: null, prompts: [] });
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    let targetChatId: string = activeChatId || "";

    // Create new chat if none exists
    if (!targetChatId) {
      try {
        const response = await fetch(`${API_BASE_URL}/createConversation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const newChat = await response.json();
        targetChatId = newChat._id;
        setActiveChatId(newChat._id);
        setChats((prev) => [
          { _id: newChat._id, prompt: null, prompts: [] },
          ...prev,
        ]);
      } catch (error) {
        console.error("Error creating conversation:", error);
        return;
      }
    }

    const promptText = inputValue;
    setInputValue("");
    setIsGenerating(true);

    try {
      // This call triggers: Frontend → Node.js → Flask → Stable Diffusion
      const response = await fetch(`${API_BASE_URL}/prompt/${targetChatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      console.log("Image generated:", data);

      // Refresh the conversation to get the newly generated image
      await fetchConversationById(targetChatId);
      await fetchAllConversations();
    } catch (error) {
      console.error("Error sending prompt:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const arrayBufferToBase64 = (buffer: number[]) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const getImageDataUri = (
    imageData: any,
    contentType: string = "image/png"
  ) => {
    if (!imageData) return null;

    let base64: string | null = null;

    // If it's already a base64 string
    if (typeof imageData === "string") {
      base64 = imageData;
    }
    // If it's a Buffer object with data array
    else if (imageData.type === "Buffer" && Array.isArray(imageData.data)) {
      base64 = arrayBufferToBase64(imageData.data);
    }
    // If it's just an array of numbers
    else if (Array.isArray(imageData)) {
      base64 = arrayBufferToBase64(imageData);
    }

    if (base64) {
      return `data:${contentType};base64,${base64}`;
    }

    return null;
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
            {chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setActiveChatId(chat._id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                  activeChatId === chat._id ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-gray-900 truncate mb-0.5">
                  {chat.prompt || "New chat"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {chat.prompt
                    ? chat.prompt.slice(0, 60)
                    : "Start a conversation"}
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
            {activeChat &&
            activeChat.prompts &&
            activeChat.prompts.length > 0 ? (
              <div className="space-y-6">
                {activeChat.prompts.map((message) => (
                  <div key={message._id}>
                    {/* User Message */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          You
                        </div>
                        <div className="text-gray-800 leading-7">
                          {message.prompt}
                        </div>
                      </div>
                    </div>

                    {/* Assistant Response with Image */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-sm font-medium text-gray-900 mb-3">
                          Claude
                        </div>
                        {message.image && message.image.data && (
                          <div className="rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={
                                getImageDataUri(
                                  message.image.data,
                                  message.image.contentType
                                ) || ""
                              }
                              alt={message.prompt}
                              className="w-full h-auto max-w-2xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading State */}
                {isGenerating && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-sm font-medium text-gray-900 mb-3">
                        Claude
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating image...
                      </div>
                    </div>
                  </div>
                )}
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
                    Describe an image you'd like me to generate
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
                placeholder="Describe the image you want to generate..."
                className="min-h-[60px] max-h-[200px] resize-none pr-12 text-base"
                disabled={isGenerating}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isGenerating}
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 rounded-md"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by Stable Diffusion • Image generation may take a moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
