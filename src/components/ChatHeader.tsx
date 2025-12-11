import { useEffect, useState } from "react";

import api from "../lib/axios";
// import useUser from "../hooks/useUser";
import type { Conversation } from "../types/conversation";

const ChatHeader: React.FC<{ conversationId: string | null }> = ({
  conversationId,
}) => {
  // const { user } = useUser();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch conversation details
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/${conversationId}`);
        setConversation(res.data.data);
      } catch (err) {
        console.error("Failed to fetch conversation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  return (
    <div className="flex flex-row items-center px-4 gap-3 h-16 w-full border-b border-base-300">
      Stable Diffusion
    </div>
  );
};

export default ChatHeader;
