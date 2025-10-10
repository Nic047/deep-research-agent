import React from "react";
import { Spinner } from "@/components/ui/spinner";

function loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="size-5" />
    </div>
  );
}

export default loading;
