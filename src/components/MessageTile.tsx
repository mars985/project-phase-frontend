import React from "react";
import type { Message } from "../types/prompt";

// function getTimestampFromObjectId(objectId: string) {
//   if (!objectId || objectId.length < 8) return null;
//   try {
//     const timestamp = parseInt(objectId.substring(0, 8), 16);
//     return new Date(timestamp * 1000);
//   } catch {
//     return null;
//   }
// }

const MessageTile: React.FC<{ message: Message; isOwn: boolean }> = ({
  message,
}) => {
  return (
    <div>{message.body}</div>
    // <div
    //   className={`
    //     ${
    //       isOwn
    //         ? "bg-primary/20"
    //         : "bg-base-200"
    //     }
    //     text-base-content shadow-sm
    //   `}
    //   style={{
    //     padding: "8px 12px",
    //     display: "flex",
    //     flexDirection: "column",
    //     maxWidth: "75%",
    //     borderRadius: "12px",
    //     wordBreak: "break-word",
    //     alignItems: isOwn ? "flex-end" : "flex-start",
    //     whiteSpace: "pre-wrap",
    //   }}
    // >
    //   {isOwn ? (
    //     <span className="text-xs text-base-content/70">You</span>
    //   ) : (
    //     <span className="text-sm text-base-content/70">
    //       {message.sender.username}
    //     </span>
    //   )}

    //   {/* Message body + timestamp */}
    //   <div className="flex items-end gap-1">
    //     <span className="text-base">{message.body}</span>
    //     {timeString && (
    //       <span className="text-[10px] text-base-content/60">{timeString}</span>
    //     )}
    //   </div>
    // </div>
  );
};

export default MessageTile;
