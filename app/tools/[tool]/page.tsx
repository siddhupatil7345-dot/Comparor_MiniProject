"use client";

import { useParams } from "next/navigation";
import JsonDiff from "../../components/JsonDiff";

const toolsMap: { [key: string]: React.ComponentType } = {
  "json-diff": JsonDiff
};

export default function ToolPage() {
  const params = useParams();
  const toolName = Array.isArray(params.tool) ? params.tool[0] : params.tool;

  const ToolComponent = toolName ? toolsMap[toolName] : undefined;

  if (!ToolComponent) {
    return <div className="p-8 text-red-600">Tool not found: {toolName}</div>;
  }

  return <ToolComponent />;
}
