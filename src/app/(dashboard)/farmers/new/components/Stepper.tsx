import { Fragment } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { REGISTRATION_STEPS } from "../steps";

// From md up every step gets the same 132px column so the circles line up evenly
// from edge to edge; the connector's -50px margin (half column minus the 16px
// circle radius) lets it run under the label columns right up to the circle edges.
// Below md the labels are hidden and the columns share the width equally.

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <Card className="overflow-x-auto px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <ol className="flex items-start justify-between md:min-w-[900px]">
        {REGISTRATION_STEPS.map((step, i) => {
          const stepNo = i + 1;
          const isActive = stepNo === currentStep;
          const isDone = stepNo < currentStep;
          const isLast = i === REGISTRATION_STEPS.length - 1;

          return (
            <Fragment key={step.label}>
              <li className="flex flex-1 shrink-0 flex-col items-center md:w-[132px] md:flex-none">
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-semibold ring-4",
                    isActive || isDone
                      ? "bg-brand-green text-white ring-brand-tint"
                      : "bg-line text-gray-500 ring-gray-100"
                  )}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    stepNo
                  )}
                </div>

                <span className={cn("mt-3 hidden text-[12.5px] font-semibold md:block", isActive ? "text-brand-green" : "text-gray-500")}>
                  Step {stepNo}
                </span>
                <span className={cn("mt-1 hidden whitespace-nowrap text-[12.5px] md:block", isActive ? "font-semibold text-ink" : "font-medium text-gray-500")}>
                  {step.label}
                </span>
              </li>

              {!isLast && (
                <li
                  aria-hidden
                  className="mt-[15px] h-0.5 flex-1 bg-line md:-mx-[50px]"
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </Card>
  );
}
