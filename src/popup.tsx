import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { URLMainView } from "@/url/ui/URLMainView";
import "./popup.css";

const Popup = () => {
  return (
    <div className="p-6 w-[24rem] h-[36rem]">
      <h1 className="font-medium flex-0">Pretty Params</h1>
      <URLMainView />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
