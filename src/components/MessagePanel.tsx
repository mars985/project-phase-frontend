import React, { useEffect, useRef, useState } from "react";

import MessageTile from "./MessageTile";
import MessageBox from "./MessageBox";
import ChatHeader from "./ChatHeader";

import type { Message } from "../types/prompt";
import api from "../lib/axios";
import socket from "../lib/socket";

// --- component ---
const MessagePanel: React.FC<{ conversationId: string | null }> = ({
  conversationId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // const { user } = useUser();

  // listen for new messages
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversationId]);

  // initial fetch
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversationId}`);
        setMessages(res.data.data);

        requestAnimationFrame(() => {
          containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "auto",
          });
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // scroll to bottom on new message
  useEffect(() => {
    if (!messages.length) return;

    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const renderMessages = () => {
    if (!messages.length)
      return (
        <div className="text-center text-base-content/60 py-6">
          No messages found.
        </div>
      );

    // newest -> oldest (so first DOM child is the newest)
    const reversed = [...messages].reverse();

    return reversed.map((message, idx) => {
      // const messageDate = formatDate(message._id);
      const isOwn = true; // TODO

      return (
        <React.Fragment key={message._id}>
          <div
            className={`message-wrapper flex ${
              isOwn ? "justify-end" : "justify-start"
            } ${idx === 0 ? "pb-6" : ""}`} // bottom padding for the very bottom-most (newest) item
          >
            <MessageTile message={message} isOwn={isOwn} />
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col relative">
      <ChatHeader conversationId={conversationId} />
      <div
        ref={containerRef}
        className="h-[80vh] overflow-y-auto px-4 flex flex-col-reverse gap-2"
      >
        {renderMessages()}
      </div>

      <MessageBox conversationId={conversationId} />
    </div>
  );
};

export default MessagePanel;
