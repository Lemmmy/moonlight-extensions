import { matchKeywords } from "@moonlight-mod/wp/highlight2_highlight";
import { addRule, blacklistFromRuleset } from "@moonlight-mod/wp/markdown_markdown";

addRule(
  "highlight2Highlight",
  (rules) => ({
    order: rules.text.order - 0.5,
    match: matchKeywords,
    parse(capture, recurseParse, state) {
      const newState = { ...state, __highlightSearch: true };
      return [
        recurseParse(capture[2], newState),
        {
          type: "highlight",
          content: capture[1]
        },
        recurseParse(capture[3], newState)
      ];
    }
  }),
  () => ({ type: "skip" })
);

blacklistFromRuleset("INLINE_REPLY_RULES", "highlight2Highlight");
blacklistFromRuleset("EMBED_TITLE_RULES", "highlight2Highlight");
