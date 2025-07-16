# Fixes Required

## 1. Drop Shadow Improvements
- [x] For background style dropshadow, use opposing color (dark background = white shadow, light background = black shadow)
- [x] Change drop shadow to -5px 5px with no blur
- [x] Implement color brightness detection algorithm (translate Ruby code to JavaScript)
- [ ] Revisit text color inversion for fine-tuning

## 2. Element Selection Behavior 🔄 **PARTIAL - MORE WORK NEEDED**
- [x] Elements should not change appearance when clicked/selected
- [x] Properties panel should be prefilled with current element properties
- [x] No visual changes should occur on selection
- [ ] **Additional work required** (details TBD)

## 3. Background Style Cleanup 🔄 **PARTIAL - MORE WORK NEEDED**
- [x] Remove "plain" background style option (seems identical to "none")
- [x] Keep only: none, highlight, drop-shadow
- [ ] **Additional work required** (details TBD)

## 4. Font Size Defaults ✅ **COMPLETED**
- [x] Increase default subtitle size to 48px
- [x] Change default title sizes to 72px

## 5. Logo Placement Stability ✅ **COMPLETED**
- [x] Adding/removing logos should not affect position/rotation of existing logos
- [x] Preserve existing logo positions when updating logo selection

## 6. Subtitle Selection Border 🔄 **PARTIAL - MORE WORK NEEDED**
- [x] Selection border should show around the background/highlight area, not just the text
- [x] Border should encompass the full subtitle wrapper when selected
- [ ] **Additional work required** (details TBD)

---
*Do not check off items until confirmed as acceptably resolved*