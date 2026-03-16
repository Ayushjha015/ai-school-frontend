import type { ValidationErrorResponse } from '../types/api';

const validationFieldAliases: Record<string, string> = {
  roll_number: 'rollNumber',
  parent_email: 'parentEmail',
  parent_phone: 'parentPhone',
  group_id: 'groupId',
  branch_id: 'branchId',
  organization_id: 'organizationId',
};

export function parseValidationErrors(payload: ValidationErrorResponse | undefined) {
  const errors: Record<string, string> = {};
  const detail = payload?.message?.detail;

  if (!Array.isArray(detail)) {
    return errors;
  }

  for (const item of detail) {
    const rawField = String(item.loc[item.loc.length - 1] ?? 'form');
    const field = validationFieldAliases[rawField] ?? rawField;
    errors[field] = item.msg;
  }

  return errors;
}
