export type PromptItem = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  tags: string[];
};

export const prompts: PromptItem[] = [
  {
    id: "brief-critique",
    title: "Structured critique",
    category: "Writing",
    excerpt: "Get line-level feedback with clear criteria instead of vague praise.",
    body: `You are a sharp editor. Read the draft below and respond with:
1) A one-sentence thesis of what the piece is trying to do
2) Three strengths (specific quotes)
3) Three risks or weak spots (specific quotes)
4) Five concrete revision moves, ordered by impact

Draft:
"""{{paste}}"""`,
    tags: ["editing", "feedback"],
  },
  {
    id: "sql-explainer",
    title: "SQL from intent",
    category: "Code",
    excerpt: "Turn a plain-language question into a query, then explain each clause.",
    body: `Given this schema (adjust as needed):
{{schema}}

Write PostgreSQL that answers: "{{question}}"

Return:
- The final query (formatted)
- A short explanation of joins, filters, and aggregations
- Two edge cases the query might miss`,
    tags: ["sql", "analysis"],
  },
  {
    id: "research-synth",
    title: "Source synthesis",
    category: "Research",
    excerpt: "Merge conflicting takes into a careful, cited summary.",
    body: `Synthesize the following sources about "{{topic}}". Assume they may disagree.

Sources:
{{bullets}}

Output:
- Neutral overview (6–8 sentences)
- Areas of agreement
- Open disagreements with the strongest evidence on each side
- What a careful reader should still verify`,
    tags: ["notes", "rigor"],
  },
  {
    id: "story-beat",
    title: "Scene pressure",
    category: "Creative",
    excerpt: "Push a scene toward conflict without breaking voice.",
    body: `You are a fiction coach. Here is a scene in {{voice}} voice:

"""{{scene}}"""

Propose:
- A single change that raises stakes in the first 200 words
- Two lines of dialogue that reveal subtext
- One sensory detail that sharpens place
Keep the original tone; do not summarize the scene.`,
    tags: ["narrative", "voice"],
  },
  {
    id: "meeting-prep",
    title: "Decision memo",
    category: "Work",
    excerpt: "Turn scattered notes into a tight pre-read for stakeholders.",
    body: `Turn these bullets into a 1-page decision memo for {{audience}}.

Context bullets:
{{bullets}}

Format:
- Situation / Complication / Question
- Options (with tradeoffs + owners)
- Recommendation + next 72 hours`,
    tags: ["ops", "clarity"],
  },
  {
    id: "api-contract",
    title: "API contract tutor",
    category: "Code",
    excerpt: "Design an endpoint sketch with errors, pagination, and idempotency hints.",
    body: `Design a REST-ish API for: "{{feature}}".

Constraints: {{constraints}}

Deliver:
- Resource model (fields + types)
- Endpoints table (method, path, request, response)
- Error shape with 4 realistic codes
- Idempotency and pagination notes`,
    tags: ["design", "backend"],
  },
];
