"use client";

import { Children, forwardRef, isValidElement, useState, type ChangeEvent, type ReactElement, type ReactNode, type SelectHTMLAttributes } from "react";
import { Dropdown, type DropdownOption } from "./Dropdown";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

type OptionProps = { value?: string | number; children?: ReactNode; disabled?: boolean };

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((n) => (typeof n === "string" || typeof n === "number" ? String(n) : isValidElement<{ children?: ReactNode }>(n) ? textOf(n.props.children) : ""))
    .join("");

// Flattens the <option> children (including fragments and mapped arrays) into dropdown options.
function optionsOf(children: ReactNode): DropdownOption[] {
  const out: DropdownOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === "option") {
      const { value, children: label, disabled } = (child as ReactElement<OptionProps>).props;
      const text = textOf(label);
      out.push({ value: value === undefined ? text : String(value), label: text, disabled });
    } else {
      out.push(...optionsOf((child as ReactElement<{ children?: ReactNode }>).props.children));
    }
  });
  return out;
}

// Drop-in replacement for the native <select>: same props and <option> children, rendered with the portal's
// styled Dropdown (green focus ring, divided rows, placeholder row). A visually hidden native <select> carries
// `name` / `required` so forms read via FormData and native validation keep working.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, value, defaultValue, onChange, name, id, disabled, required, title }, ref) => {
    const options = optionsOf(children);
    // Like a native select, an uncontrolled field starts on the first selectable option unless a default is given.
    const [internal, setInternal] = useState(() => String(defaultValue ?? options.find((o) => !o.disabled)?.value ?? ""));
    const current = value !== undefined ? String(value) : internal;

    const handleChange = (next: string) => {
      if (value === undefined) setInternal(next);
      const target = { value: next, name: name ?? "", id: id ?? "" } as HTMLSelectElement;
      onChange?.({ target, currentTarget: target } as ChangeEvent<HTMLSelectElement>);
    };

    return (
      <div className="relative" title={title}>
        <Dropdown id={id} value={current} onChange={handleChange} options={options} disabled={disabled} triggerClassName={className} />
        <select
          ref={ref}
          name={name}
          required={required}
          disabled={disabled}
          value={current}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);

Select.displayName = "Select";
