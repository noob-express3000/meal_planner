# Meal Planner

A polished, local-first meal planner designed for **people and browser agents to use together** through WebMCP.

Instead of forcing an agent to scrape buttons and cards, Meal Planner exposes its real application capabilities as structured browser tools. The website becomes durable meal memory and a deterministic calculation layer; the agent handles conversational planning and reasoning.

## The demo interaction

Ask a WebMCP-capable browser agent:

> Plan four dinners from my saved recipes, use what is already in my pantry, avoid repeating last week, then build my shopping list.

The agent can read recipe memory, pantry inventory and prior plans, choose recipes with the user, write the approved plan back to the page, and calculate exact shopping quantities without guessing at the UI.

## What it remembers

Data is stored locally in the browser under a versioned storage key. No account or backend is required.

- Recipes
  - name
  - base servings
  - prep time
  - cook time
  - tags
  - structured ingredient name / quantity / unit
  - ordered instructions
  - created / updated timestamps
- Meal plans
  - date
  - breakfast / lunch / dinner slot
  - recipe reference
  - planned servings
  - historical weeks remain queryable
- Pantry
  - ingredient
  - quantity
  - unit
- Shopping calculations
  - scale recipe ingredients to planned servings
  - aggregate matching ingredient + unit pairs
  - subtract matching pantry quantities

The **Export** button produces a JSON backup of all stored data.

## WebMCP tools

The app currently registers 13 imperative tools with `document.modelContext.registerTool()`:

| Tool | Purpose |
| --- | --- |
| `meal_context` | Read recipes, pantry, plan and shopping list for a date range in one planning call |
| `list_recipes` | Search recipes by name, tag, ingredient or total time |
| `get_recipe` | Retrieve a complete recipe and optionally scale it to target servings |
| `save_recipe` | Create/update a structured recipe |
| `delete_recipe` | Delete a recipe and dependent planned meals |
| `get_meal_plan` | Read planned meals and historical weeks |
| `plan_meal` | Write one meal slot |
| `plan_meals` | Write several approved meal slots in one agent call |
| `remove_meal` | Remove one planned slot |
| `list_pantry` | Read on-hand inventory |
| `set_pantry_item` | Set/remove an ingredient quantity |
| `build_shopping_list` | Calculate scaled shopping quantities, optionally subtracting pantry stock |
| `export_meal_data` | Return the complete local data snapshot |

All tool implementations call the **same functions used by the human UI**. Tool calls immediately update the visible interface and persisted state.

Example registration pattern:

```js
await document.modelContext.registerTool({
  name: "plan_meal",
  description: "Create or replace one meal-plan slot for a date.",
  inputSchema: {
    type: "object",
    properties: {
      date: { type: "string" },
      meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner"] },
      recipe_id: { type: "string" },
      servings: { type: "number", minimum: 0.01 }
    },
    required: ["date", "meal_type", "recipe_id", "servings"],
    additionalProperties: false
  },
  execute: async (input) => planMeal(input)
});
```

## Why WebMCP matters here

Meal planning is naturally conversational, but the underlying state is not. Recipes have exact quantities. Weeks have dates. Pantry stock has units. Shopping lists require deterministic arithmetic. Prior meal plans matter when a user says “not what I had last week.”

Without WebMCP, an agent has to infer this state from visual UI or depend on a separate proprietary backend integration. With WebMCP, the site itself exposes the authoritative operations and data structures directly to the browser agent.

The division of labor is deliberate:

- **Human:** preferences, approval, edits, visual overview.
- **Agent:** conversational reasoning, comparison, orchestration.
- **Website tools:** persistence, validation, exact data mutation and quantity math.

## Run locally

There is no build step and no dependency install.

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

For WebMCP testing, use a supported browser environment. The Challenge supports ChatGPT's in-app browser or a WebMCP-enabled Chrome build. The green header badge reports how many tools registered successfully.

## Deploy

This is a static site. Deploy the repository root to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, Render static sites, etc.). HTTPS is recommended for the browser API and clipboard features.

For Netlify, `netlify.toml` is already included and the publish directory is the repository root.

## Suggested <3 minute demo

1. Open the live site in a WebMCP-capable browser and show the tool-count badge.
2. Ask the agent to save 2–3 recipes with real quantities and cooking times.
3. Add several pantry items from the UI or via the agent.
4. Ask the agent to inspect current context and plan meals for the week.
5. Show the planner update immediately as tools execute.
6. Ask for the shopping list; show serving scaling and pantry subtraction.
7. Ask what was planned in the previous week to demonstrate persistent history.

## Submission framing

**Strong fit for WebMCP:** meal planning requires a conversational agent to coordinate with exact, stateful application data. Structured tools remove UI guessing and make planning reliable.

**Better UX:** the user can switch freely between direct manipulation and natural language. Both surfaces modify the same state.

**Previously difficult:** a general browser agent can now reason over a site's private local recipe/pantry/plan state and safely mutate it through explicit schemas without a bespoke remote MCP server or fragile DOM automation.

## License

MIT
