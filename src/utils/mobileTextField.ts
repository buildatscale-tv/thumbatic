// The mobile text field lives in a sheet at the bottom of the screen, but the tap that
// starts editing happens on the canvas. A phone opens its keyboard only when focus moves
// during a user gesture, so the canvas has to focus that field synchronously inside the
// tap handler. This holds the reference between the two components.

let field: HTMLTextAreaElement | null = null;

export function registerMobileTextField(element: HTMLTextAreaElement | null): void {
  field = element;
}

/** Focuses the sheet field and puts the caret at the end. Call this inside a tap handler. */
export function focusMobileTextField(): void {
  if (!field) return;
  field.focus();
  const end = field.value.length;
  field.setSelectionRange(end, end);
}
