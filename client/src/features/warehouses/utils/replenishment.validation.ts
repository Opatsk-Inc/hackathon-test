export interface ReplenishmentFormState {
  resourceId: string
  quantity: string
  priority: string
}

export function validateReplenishmentForm(
  form: ReplenishmentFormState
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.resourceId) errors.resourceId = "Select resource"
  if (!form.quantity || parseInt(form.quantity, 10) < 1) {
    errors.quantity = "Enter quantity (min. 1)"
  }
  if (!form.priority) errors.priority = "Select priority"
  return errors
}
