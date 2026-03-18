# Photo-Grab Tasks

## Completed

### v1.8.3 — Custom Theme Feature
- Added `.ibd-theme-custom` CSS class with CSS custom property variables
- Added thumb slider position for custom theme in `.ibd-theme-toggle`
- Added full `.ibd-custom-theme-builder` UI styles (grid, swatches, presets, actions)
- Added "Custom" radio button (7th option) in the theme picker in `popup.html`
- Added custom theme builder panel with 6 color pickers (Accent, Background, Card, Text, Subtitle, Border)
- Added 5 quick presets: Midnight, Forest, Sunset, Ocean, Rose
- Added Reset button for custom theme
- Added `toggleCustomThemeBuilder()` function to show/hide builder vs primary color row
- Added `applyCustomThemeVars()` / `clearCustomThemeVars()` functions
- Added `CUSTOM_THEME_PRESETS` and `CUSTOM_THEME_DEFAULT` constants
- Added `initCustomThemeBuilder()` IIFE with full save/load/apply logic
- Updated `applyTheme()` to include `'custom'` in themes array
- Custom theme state persisted to `browser.storage.local` via `ibd_customThemeVars_v1` key
- Startup correctly toggles builder visibility based on saved theme
