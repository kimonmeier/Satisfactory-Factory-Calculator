# Satisfactory Fabriken Planer

A web-based application to help plan and optimize your factories in the game Satisfactory. Calculate resource inputs, outputs, and overall production balance.

## Features

- **Factory Management:**
  - Add, edit, and delete individual factories.
  - Specify factory name, floor level, output resource, recipe, and output rate.
- **Recipe Selection:**
  - Choose from a comprehensive list of in-game items and recipes.
  - Automatic recipe suggestion based on selected output.
- **Raw Material Input:**
  - Define available raw material (ore) inputs and their rates.
  - Option to update or add to existing raw material counts.
- **Resource Summary:**
  - View an overall balance of produced vs. consumed resources.
  - Highlights surplus and deficit for both raw materials and crafted items.
  - Crafted items are grouped by their origin ore for better clarity.
- **Filtering:**
  - Filter the list of factories by name, output item, or floor.
- **Persistent Storage:**

  - Factory configurations and raw material inputs are saved in the browser's local storage.

- **Custom Mod Recipes**
  - Certain Recipes can be manually added to help manage mod resources

## Tech Stack

- **Frontend:** SvelteKit, Svelte
- **Language:** TypeScript
- **Styling:** Tailwind CSS (implied from class names)
- **Data:** Static JSON files extracted from the game files
- **Deployment:** Docker, Nginx
