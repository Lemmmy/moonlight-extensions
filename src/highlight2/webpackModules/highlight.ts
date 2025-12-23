type CompiledKeyword =
  | {
      type: "regex";
      regex: RegExp;
    }
  | {
      type: "literal";
      text: string;
      needsStartBoundary: boolean;
      needsEndBoundary: boolean;
    };

let cachedKeywords: CompiledKeyword[] | null = null;
let cachedRawKeywords: string[] | null = null;

export const getKeywords = () =>
  (moonlight.getConfigOption<string[]>("highlight2", "keywords") ?? []).map((w) => w.trim()).filter(Boolean);

function compileKeywords(): CompiledKeyword[] {
  const raw = getKeywords();

  if (cachedRawKeywords && JSON.stringify(cachedRawKeywords) === JSON.stringify(raw)) {
    return cachedKeywords!;
  }

  cachedRawKeywords = raw;
  cachedKeywords = raw.map((keyword) => {
    const regexMatch = keyword.match(/^\/(.+?)\/([gimsuvy]*)$/);
    if (regexMatch) {
      try {
        return {
          type: "regex",
          regex: new RegExp(regexMatch[1], regexMatch[2])
        };
      } catch {
        return {
          type: "literal",
          text: keyword.toLowerCase(),
          needsStartBoundary: /^\w/.test(keyword),
          needsEndBoundary: /\w$/.test(keyword)
        };
      }
    }

    return {
      type: "literal",
      text: keyword.toLowerCase(),
      needsStartBoundary: /^\w/.test(keyword),
      needsEndBoundary: /\w$/.test(keyword)
    };
  });

  return cachedKeywords;
}

const wordChar = /\w/;
export function matchKeywords(source: string, state?: any) {
  if (state?.__highlightSearch) return null;

  const keywords = compileKeywords();

  for (const keyword of keywords) {
    if (keyword.type === "regex") {
      const match = source.match(keyword.regex);
      if (match && match.index !== undefined) {
        const i = match.index;
        const matchedText = match[0];
        const start = source.substring(0, i);
        const end = source.substring(i + matchedText.length);
        return [source, matchedText, start, end];
      }
    } else {
      const i = source.toLowerCase().indexOf(keyword.text);
      if (i === -1) continue;

      if (keyword.needsStartBoundary && i !== 0 && wordChar.test(source[i - 1])) continue;
      if (
        keyword.needsEndBoundary &&
        source.length > i + keyword.text.length &&
        wordChar.test(source[i + keyword.text.length])
      )
        continue;

      const start = source.substring(0, i);
      const end = source.substring(i + keyword.text.length);
      return [source, source.substring(i, i + keyword.text.length), start, end];
    }
  }

  return null;
}

export const shouldHighlight = (message: any, channelId: any) => matchKeywords(message.content) !== null;
