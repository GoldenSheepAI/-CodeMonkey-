import type { ToolCall } from "../../types/index.js";
import { errorColor } from "../../ui/colors.js";

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
      console.log(
        errorColor("Tool call failed to parse from JSON code block.")
      );
      console.log();
    }
  }

  // Look for standalone JSON blocks in the content (multiline without code blocks)
  const jsonBlockRegex =
    /\{\s*\n\s*"name":\s*"([^"]+)",\s*\n\s*"arguments":\s*\{[\s\S]*?\}\s*\n\s*\}/g;
  let jsonMatch;
  while ((jsonMatch = jsonBlockRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.name && parsed.arguments !== undefined) {
        extractedCalls.push({
          id: `call_${Date.now()}_${extractedCalls.length}`,
          function: {
            name: parsed.name || "",
            arguments: parsed.arguments || {},
          },
        });
      }
    } catch (e) {
      console.log(errorColor("Tool call failed to parse from JSON block."));
      console.log();
    }
  }

  // Look for XML-style tool calls like <execute_bash>
  const xmlToolCallRegex =
    /<([a-zA-Z_][a-zA-Z0-9_]*)\s*>\s*\{\s*"?([^"]*)"?\s*:\s*"([^"]*)"\s*\}\s*<\/\1>/g;
  let xmlMatch;
  while ((xmlMatch = xmlToolCallRegex.exec(content)) !== null) {
    const [, toolName, argKey, argValue] = xmlMatch;
    try {
      if (toolName && argKey && argValue !== undefined) {
        const args: { [key: string]: string } = {};
        args[argKey] = argValue;
        extractedCalls.push({
          id: `call_${Date.now()}_${extractedCalls.length}`,
          function: {
            name: toolName,
            arguments: args,
          },
        });
      }
    } catch (e) {
      console.log(errorColor("Tool call failed to parse from XML."));
      console.log();
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
        console.log(errorColor("Tool call failed to parse from content."));
        console.log();
      }
    }
  }

  // Deduplicate identical tool calls
  const uniqueCalls = deduplicateToolCalls(extractedCalls);

  return uniqueCalls;
}

function deduplicateToolCalls(toolCalls: ToolCall[]): ToolCall[] {
  const seen = new Set<string>();
  const unique: ToolCall[] = [];

  for (const call of toolCalls) {
    // Create a hash of the function name and arguments for comparison
    const hash = `${call.function.name}:${JSON.stringify(
      call.function.arguments
    )}`;

    if (!seen.has(hash)) {
      seen.add(hash);
      unique.push(call);
    } else {
    }
  }

  return unique;
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

  // Remove XML-style tool calls
  const xmlToolCallRegex =
    /<([a-zA-Z_][a-zA-Z0-9_]*)\s*>\s*\{\s*"?([^"]*)"?\s*:\s*"([^"]*)"\s*\}\s*<\/\1>/g;
  cleanedContent = cleanedContent.replace(xmlToolCallRegex, "").trim();

  // Remove JSON blocks that were parsed as tool calls
  const toolCallPatterns = [
    /\{\s*\n\s*"name":\s*"([^"]+)",\s*\n\s*"arguments":\s*\{[\s\S]*?\}\s*\n\s*\}/g, // Multiline JSON blocks
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
