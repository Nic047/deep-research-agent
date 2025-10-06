import React from "react";
import { MainInput } from "./main-input";

function MainChat() {
  return (
    <div className="space-y-[70vh]">
      <div className="text-2xl text-muted-foreground relative top-[10vh]">
        <span className="text-primary">Welcome back, </span>
        <span className="text-gray-500">Nicolae!</span>
      </div>
      <div>
        <MainInput />
      </div>
    </div>
  );
}

export default MainChat;
