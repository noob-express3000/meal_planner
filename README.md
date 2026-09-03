# Meal Planner

Static meal-planning application with a WebMCP interface.

Live application: https://meal-planner-llai.onrender.com/

The application stores recipes, pantry inventory and dated meal plans in browser localStorage. It derives shopping quantities from the stored records. The human interface and WebMCP tools call the same functions and modify the same state.

## Functional scope

| Area | Stored or calculated data |
| --- | --- |
| Recipes | Name, base servings, preparation time, cooking time, tags, ingredients and ordered instructions |
| Ingredients | Name, numeric quantity or unquantified value, and unit |
| Meal plans | Date, breakfast/lunch/dinner slot, recipe reference and serving count |
| History | Meal-plan records remain queryable by date range |
| Pantry | Ingredient name, quantity and unit |
| Shopping list | Required quantity, pantry quantity used, remaining quantity and contributing recipes |
| Export | Complete state snapshot as JSON |

Recipe quantities are scaled by planned servings. Shopping calculations group ingredients by normalized name and unit, sum the scaled requirements, and optionally subtract matching pantry stock. The application does not perform unit conversion.

Deleting a recipe also removes meal-plan entries that reference it. Setting a pantry quantity to zero removes that pantry record.

## WebMCP implementation

The application registers 13 tools with document.modelContext.registerTool():

| Tool | Operation |
| --- | --- |
| meal_context | Return recipes, pantry inventory, planned meals and calculated shopping items for a date range |
| list_recipes | Filter recipes by text, tags and maximum total cooking time |
| get_recipe | Return one complete recipe and optionally scale its ingredient quantities |
| save_recipe | Create or update a structured recipe |
| delete_recipe | Delete a recipe and its dependent planned meals |
| get_meal_plan | Return planned meals for a date range |
| plan_meal | Create or replace one dated meal slot |
| plan_meals | Create or replace multiple meal slots in one call |
| remove_meal | Remove one dated meal slot |
| list_pantry | Return current pantry inventory |
| set_pantry_item | Create, replace or remove a pantry quantity |
| build_shopping_list | Calculate shopping quantities for a date range |
| export_meal_data | Return the complete stored state |

Each tool defines a JSON input schema, validates input through the application functions, returns structured JSON-safe data and updates the visible page after a mutation.

There is no separate MCP server. Tool registration and execution happen in the page.

## State flow

1. A UI event or WebMCP tool calls an application function.
2. The function validates and normalizes the input.
3. The function reads or modifies the in-memory state.
4. Mutations write the complete versioned state to localStorage.
5. The planner, recipe list, pantry and shopping list rerender from that state.

Storage key: meal-planner.webmcp.v1

No account, backend service or database is required. State is specific to the browser profile and site origin. The Export action creates a portable JSON snapshot.

## Agent workflow

Example request:

> Plan four dinners from my saved recipes, use what is already in my pantry, avoid repeating last week, then build my shopping list.

Expected tool sequence:

1. meal_context reads the current recipes, pantry, current plan and relevant history.
2. list_recipes or get_recipe retrieves additional recipe detail when required.
3. The agent presents or selects a plan.
4. plan_meals writes the approved meal slots.
5. build_shopping_list returns scaled requirements after pantry subtraction.
6. The same changes are immediately visible in the human interface.

This division is intentional:

- The user supplies preferences and approves decisions.
- The agent handles selection and multi-step orchestration.
- The website owns persistence, validation, state mutation and quantity calculations.

## Interface

The interface provides four views:

- Weekly plan
- Recipes
- Pantry
- Shopping

The header reports the number of WebMCP tools registered in the current browser. Agent Prompt copies the example request. Export downloads the stored state.

The interface remains usable without WebMCP. Agent tools require ChatGPT's in-app browser or a WebMCP-enabled Chrome build.

## Run locally

No package installation or build step is required.

~~~bash
python -m http.server 8080
~~~

Open http://localhost:8080/.

## Deployment

The project is a static site. Serve the repository root over HTTPS.

Render configuration is included in render.yaml. Netlify configuration is included in netlify.toml.

## Repository structure

| File | Purpose |
| --- | --- |
| index.html | Application markup and controls |
| styles.css | Responsive interface styles |
| app.js | State model, calculations, UI logic and WebMCP tools |
| favicon.svg | Site icon |
| render.yaml | Render static-site configuration |
| netlify.toml | Netlify static-site configuration |

## License

MIT
