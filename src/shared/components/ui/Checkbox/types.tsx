import { Root } from "@radix-ui/react-checkbox";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof Root> {
  label: string;
  details?: string;
  inputClassName?: string;
  labelClassName?: string;
}
