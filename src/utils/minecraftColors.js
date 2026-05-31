// Vanilla Minecraft chat colors (§ codes).
// Codes match what the game uses on signs, item names, lore, etc.
export const MC_COLORS = [
  { code: 'white',        hex: '#FFFFFF', mcCode: '§f', label: 'White' },
  { code: 'gray',         hex: '#AAAAAA', mcCode: '§7', label: 'Gray' },
  { code: 'dark_gray',    hex: '#555555', mcCode: '§8', label: 'Dark Gray' },
  { code: 'black',        hex: '#000000', mcCode: '§0', label: 'Black' },
  { code: 'dark_red',     hex: '#AA0000', mcCode: '§4', label: 'Dark Red' },
  { code: 'red',          hex: '#FF5555', mcCode: '§c', label: 'Red' },
  { code: 'gold',         hex: '#FFAA00', mcCode: '§6', label: 'Gold' },
  { code: 'yellow',       hex: '#FFFF55', mcCode: '§e', label: 'Yellow' },
  { code: 'dark_green',   hex: '#00AA00', mcCode: '§2', label: 'Dark Green' },
  { code: 'green',        hex: '#55FF55', mcCode: '§a', label: 'Green' },
  { code: 'aqua',         hex: '#55FFFF', mcCode: '§b', label: 'Aqua' },
  { code: 'dark_aqua',    hex: '#00AAAA', mcCode: '§3', label: 'Dark Aqua' },
  { code: 'dark_blue',    hex: '#0000AA', mcCode: '§1', label: 'Dark Blue' },
  { code: 'blue',         hex: '#5555FF', mcCode: '§9', label: 'Blue' },
  { code: 'light_purple', hex: '#FF55FF', mcCode: '§d', label: 'Light Purple' },
  { code: 'dark_purple',  hex: '#AA00AA', mcCode: '§5', label: 'Dark Purple' },
]

export const COLOR_BY_CODE = Object.fromEntries(MC_COLORS.map(c => [c.code, c]))

export function getColorHex(code) {
  return COLOR_BY_CODE[code]?.hex || '#FFFFFF'
}

// Italic by default for renamed items (Minecraft convention)
export const DEFAULT_DISPLAY_COLOR = 'white'
export const DEFAULT_LORE_COLOR = 'gray'
