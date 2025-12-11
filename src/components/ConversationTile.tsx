import React from "react";
import type { Conversation } from "../types/conversation";

interface ConversationTileProps {
  conv: Conversation;
  // user: User;
  onSelect: (id: string) => void;
}

const ConversationTile: React.FC<ConversationTileProps> = ({
  conv,
  // user,
  onSelect,
}) => {
  const lastMessage = conv.messages.at(-1);
  // const otherUsers = conv.participants.filter((p) => p._id !== user._id);

  return (
    <li
      className="
        flex items-center gap-3
        p-4 sm:p-3 md:p-4 rounded-lg shadow cursor-pointer
        transition-all duration-200
        bg-base-200 hover:bg-base-300
      "
      onClick={() => onSelect(conv._id)}
    >
      {/* {conv.type === "dm" ? (
        // <ConversationAvatar type="dm" otherUsers={otherUsers} />
      ) : ( */}
        <div className="bg-neutral text-neutral-content w-12 h-12 rounded-full flex items-center justify-center">
          {/* <Users size={24} /> */}
        </div>
      {/* )} */}

      <div className="flex flex-col overflow-hidden">
        <div className="font-medium truncate">
          {/* {conv.type === "group"
            ? conv.groupName || "Unnamed Group"
            : otherUsers.length > 0
            ? otherUsers.map((p) => p.username).join(", ")
            : "No participants"} */}
        </div>
        <div className="text-sm text-base-content/70 truncate">
          {lastMessage?.body || "No messages yet"}
        </div>
      </div>
    </li>
  );
};

export default ConversationTile;
