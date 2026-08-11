/**
 * Lightweight stubs for the `@/components/ui` barrel used by list/CRUD dialogs
 * and tables. The real components are wrappers over `@base-ui/react` (ESM)
 * which Jest cannot transpile, so these tests substitute testable equivalents.
 */

import * as React from "react";

export const Dialog = ({
  open,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) => (open ? <div data-testid="dialog">{children}</div> : null);

export const DialogContent = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="dialog-content">{children}</div>
);

export const DialogHeader = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="dialog-header">{children}</div>
);

export const DialogTitle = ({ children }: { children?: React.ReactNode }) => (
  <h2 data-testid="dialog-title">{children}</h2>
);

export const DialogDescription = ({ children }: { children?: React.ReactNode }) => (
  <p data-testid="dialog-description">{children}</p>
);

export const DialogFooter = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="dialog-footer">{children}</div>
);

export const DialogClose = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const DialogTrigger = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const DialogOverlay = () => null;

export const DialogPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }
>(function Button({ children, ...props }, ref) {
  return (
    <button type="button" ref={ref} {...props}>
      {children}
    </button>
  );
});

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea(props, ref) {
  return <textarea ref={ref} {...props} />;
});

interface SelectValueContextValue {
  onValueChange?: (value: string) => void;
}

const SelectValueContext = React.createContext<SelectValueContextValue>({});

export const Select = ({
  value,
  onValueChange,
  disabled,
  children,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) => (
  <SelectValueContext.Provider value={{ onValueChange }}>
    <div data-testid="select" data-value={value} data-disabled={disabled ? "true" : undefined}>
      {children}
    </div>
  </SelectValueContext.Provider>
);

export const SelectTrigger = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="select-trigger">{children}</div>
);

export const SelectValue = ({ children }: { children?: React.ReactNode }) => (
  <span data-testid="select-value">{children}</span>
);

export const SelectContent = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="select-content">{children}</div>
);

export const SelectItem = ({ value, children }: { value: string; children?: React.ReactNode }) => {
  const { onValueChange } = React.useContext(SelectValueContext);
  return (
    <button
      type="button"
      data-testid="select-item"
      data-value={value}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  );
};

export const Popover = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="popover">{children}</div>
);

export const PopoverTrigger = ({
  render,
}: {
  render?: React.ReactNode;
  children?: React.ReactNode;
}) => <>{render}</>;

export const PopoverContent = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="popover-content">{children}</div>
);

export const Calendar = ({
  onSelect,
}: {
  mode?: string;
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
}) => (
  <button
    type="button"
    data-testid="select-date"
    onClick={() => onSelect?.(new Date("2024-01-15T00:00:00.000Z"))}
  >
    pick-date
  </button>
);

export const CalendarDayButton = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Checkbox(props, ref) {
  return <input type="checkbox" ref={ref} {...props} />;
});

export const Badge = ({ children }: { children?: React.ReactNode }) => (
  <span data-testid="badge">{children}</span>
);

export const DropdownMenu = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const DropdownMenuTrigger = ({ render }: { render?: React.ReactNode }) => <>{render}</>;

export const DropdownMenuContent = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="dropdown-content">{children}</div>
);

export const DropdownMenuItem = ({
  children,
  onClick,
  disabled,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button type="button" onClick={onClick} disabled={disabled}>
    {children}
  </button>
);
