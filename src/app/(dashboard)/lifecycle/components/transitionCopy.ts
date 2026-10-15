import { LEAVE_FORM } from "./leave";
import { assignmentFormFor, type TransitionCopy } from "./lifecycle";
import { REACTIVATION_FORM } from "./reactivation";
import { RETIREMENT_FORM } from "./retirement";
import { SEPARATION_FORM } from "./separation";

const PAGE_FORMS: TransitionCopy[] = [LEAVE_FORM, REACTIVATION_FORM, RETIREMENT_FORM, SEPARATION_FORM];

/** Preview, route and next-step copy for any transition with a full-page form. */
export const transitionCopyFor = (code: string): TransitionCopy | undefined => PAGE_FORMS.find((f) => f.code === code) ?? assignmentFormFor(code);
