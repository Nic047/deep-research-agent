import React from "react";
import MainChat from "@/components/chat/main-chat";
import MainSidebar from "@/components/chat/main-sidebar";

function Home() {
  return (
    <div className="h-screen w-full flex">
      {/* Sidebar */}
      <div>
        <MainSidebar />
      </div>
      {/* Chat Section with Input */}
      <div className="flex-1 flex justify-center items-start p-6 overflow-auto h-screen">
        <div className="w-full max-w-4xl">
          <MainChat />
        </div>
      </div>
    </div>
  );
}

export default Home;
