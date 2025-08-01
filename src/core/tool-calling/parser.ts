import type { ToolCall } from "../../types/index.js";

export function parseToolCallsFromContent(content: string): ToolCall[] {
  const extractedCalls: ToolCall[] = [];
  let trimmedContent = content.trim();

  // Handle markdown code blocks
  const codeBlockMatch = trimmedContent.match(
    /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/
  );
  if (codeBlockMatch && codeBlockMatch[1]) {
    trimmedContent = codeBlockMatch[1].trim();
  }

  // Try to parse entire content as single JSON tool call
  if (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmedContent);
      if (parsed.name && parsed.arguments !== undefined) {
        extractedCalls.push({
          id: `call_${Date.now()}`,
          function: {
            name: parsed.name || "",
            arguments: parsed.arguments || {},
          },
        });
        return extractedCalls;
      }
    } catch (e) {
      // Not a valid JSON, continue with regex parsing
    }
  }

  // Look for embedded tool calls using regex patterns
  const toolCallPatterns = [
    /\{"name":\s*"([^"]+)",\s*"arguments":\s*(\{[^}]*\})\}/g,
    /\{"name":\s*"([^"]+)",\s*"arguments":\s*(\{[^}]+\})\}/g,
    /\{"name":\s*"([^"]+)",\s*"arguments":\s*"([^"]+)"\}/g,
  ];

  for (const pattern of toolCallPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const [, name, argsStr] = match;
      try {
        let args;
        if (argsStr && argsStr.startsWith("{")) {
          args = JSON.parse(argsStr || "{}");
        } else {
          args = argsStr || "";
        }
        extractedCalls.push({
          id: `call_${Date.now()}_${extractedCalls.length}`,
          function: {
            name: name || "",
            arguments: args as { [key: string]: any },
          },
        });
      } catch (e) {
        console.error(
          "🔍 DEBUG - Failed to parse tool call from content:",
          e,
          "Raw args:",
          argsStr
        );
      }
    }
  }

  return extractedCalls;
}

/**
 * Cleans content by removing tool call JSON blocks
 */
export function cleanContentFromToolCalls(
  content: string,
  toolCalls: ToolCall[]
): string {
  if (toolCalls.length === 0) return content;

  let cleanedContent = content;

  // Remove JSON blocks that were parsed as tool calls
  const toolCallPatterns = [
    /\{"name":\s*"([^"]+)",\s*"arguments":\s*(\{[^}]*\})\}/g,
    /\{"name":\s*"([^"]+)",\s*"arguments":\s*(\{[^}]+\})\}/g,
    /\{"name":\s*"([^"]+)",\s*"arguments":\s*"([^"]+)"\}/g,
  ];

  for (const pattern of toolCallPatterns) {
    cleanedContent = cleanedContent.replace(pattern, "").trim();
  }

  // Remove any remaining JSON-like blocks that might be tool calls
  cleanedContent = cleanedContent
    .replace(/\{"name":[^}]+\}+/g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  return cleanedContent;
}
