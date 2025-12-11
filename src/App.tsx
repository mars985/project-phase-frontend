import "./App.css";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./components/ui/resizable";
import SideBar from "./components/SideBar";
import MessagePanel from "./components/MessagePanel";

function App() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel minSize={20} maxSize={50} defaultSize={25}>
        <SideBar setConversationId={setConversationId} />
      </ResizablePanel>

      <ResizableHandle className="bg-base-300" />

      <ResizablePanel>
        <MessagePanel conversationId={conversationId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default App;
