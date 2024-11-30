import * as React from "react"

interface RadioGroupProps {
  children: React.ReactNode;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ children, name, value, onChange }) => {
  return (
    <div role="radiogroup">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          name: name as string,
          checked: child.props.value === value,
          onChange: () => onChange(child.props.value),
        } as any);
      })}
    </div>
  );
};

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label: string;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, label, ...props }) => {
  return (
    <label>
      <input type="radio" value={value} {...props} />
      {label}
    </label>
  );
};
