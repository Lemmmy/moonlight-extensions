import { matchKeywords } from "@moonlight-mod/wp/highlight2_highlight";
import { addRule, blacklistFromRuleset } from "@moonlight-mod/wp/markdown_markdown";

addRule(
  "highlightHighlight",
  (rules) => ({
    order: -1,
    match: matchKeywords,
    parse(capture, parse, state) {
      const newState = { ...state, __highlightSearch: true };
      return [parse(capture[2], newState), { type: "highlight", content: capture[1] }, parse(capture[3], newState)];
    },
    react(node, output, state) {
      return node.content;
    }
  }),
  () => ({ type: "skip" })
);

blacklistFromRuleset("INLINE_REPLY_RULES", "highlightHighlight");
blacklistFromRuleset("EMBED_TITLE_RULES", "highlightHighlight");
