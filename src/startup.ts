import { createWeightWindowDesc } from "./window";

export function startup() {
  // Write code here that should happen on startup of the plugin.

  // Register a menu item under the map icon:
  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Guest Weight Manager", () => onClickMenuItem());
  }
}

/**
 * Runs when the plugin is selected from the plugin (map) menu.
 */
function onClickMenuItem() {
  // Write code here that should happen when the player clicks the menu item under the map icon.
  ui.openWindow(createWeightWindowDesc());
}
