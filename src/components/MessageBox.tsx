import React, { useRef, useState } from "react";

const MessageBox: React.FC<{ conversationId: string | null }> = ({
  conversationId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !conversationId) return;

    try {
      if (!text.replace(/\s/g, "").length) return;
      // socket.emit("sendMessage", {
      //   message: text,
      //   conversationId,
      //   senderId: user._id,
      // });

      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="border-t border-base-300 flex flex-row items-center gap-2 p-3">
      <textarea
        ref={textareaRef}
        name="sendMessage"
        placeholder="Type a message..."
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: "90%",
          lineHeight: "1.5",
          overflow: "hidden",
        }}
        className="
          outline-none
          bg-base-200
          text-base-content
          placeholder:text-base-content/50
          rounded-lg
          text-sm
          p-3
          resize-none
        "
      />
      <button
        className="btn btn-outline btn-primary"
        disabled={text.trim() ? false : true}
      >
        Send
      </button>
    </div>
  );
};

export default MessageBox;
