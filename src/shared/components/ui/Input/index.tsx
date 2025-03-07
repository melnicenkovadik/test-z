"use client";
import { clsx } from "clsx";
import React, {
  memo,
  useMemo,
  useRef,
  useLayoutEffect,
  ChangeEvent,
  InputHTMLAttributes,
  useState,
  useEffect,
} from "react";

import s from "./CustomInput.module.scss";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string | number | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  customButton?: React.ReactNode;
  disabled?: boolean;
  inputWrapperClassName?: string;
  inputClassName?: string;
  isNumber?: boolean;
  error?: string | null;
  min?: number;
  max?: number;
  checkMax?: boolean;
  blockMax?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  checkMax = false,
  blockMax = false,
  onChange,
  placeholder = "Enter Amount",
  rightIcon,
  leftIcon,
  customButton,
  disabled,
  inputWrapperClassName,
  inputClassName,
  isNumber = true,
  error,
  min,
  max,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string | number | undefined>(
    value,
  );
  const [inputMin, inputMax] = useMemo(() => {
    if (min && max && +min > +max) {
      return [min, min];
    }
    return [min, max];
  }, [min, max]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const inputRef = useRef<HTMLInputElement>(null);
  const wasFocused = useRef<boolean>(false);

  const handleFocus = () => {
    wasFocused.current = true;
  };

  const handleBlur = () => {
    wasFocused.current = false;
  };

  useLayoutEffect(() => {
    if (wasFocused.current && inputRef.current) {
      inputRef.current.focus();
    }
  });

  return (
    <div
      className={clsx(
        s.input,
        {
          [s.input_disabled]: disabled,
          [s.is_error]: !!error,
        },
        inputWrapperClassName,
      )}
    >
      {leftIcon && <span className={s.input__left_icon}>{leftIcon}</span>}
      {error && <span className={s.input__error}>{error}</span>}
      <input
        ref={inputRef}
        maxLength={30}
        className={clsx(s.input__field, inputClassName)}
        type="text"
        inputMode={isNumber ? "decimal" : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={(e) => {
          if (isNumber) {
            const inputValue = e.currentTarget.value;
            const dotsCount = (inputValue.match(/\./g) || []).length;
            if (isNaN(+inputValue) || !isFinite(+inputValue)) {
              e.currentTarget.value = inputValue.slice(0, -1);
            }
            if (dotsCount > 1) {
              e.currentTarget.value = inputValue.slice(0, -1);
            }
            if (inputValue === ".") {
              e.currentTarget.value = "0.";
            }
            if (inputValue === "-") {
              e.currentTarget.value = "";
            }
            if (blockMax) {
              if (inputMax && +inputValue > +inputMax) {
                e.currentTarget.value = inputMax.toString();
              }
            }
          }
        }}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (checkMax) {
            if (inputMax && +e.target.value > +inputMax) {
              console.log("Input value is greater than max value");
              return;
            } else if (inputMin && +e.target.value < +inputMin) {
              console.log("Input value is less than min value");
              return;
            } else {
              onChange(e);
            }
          } else {
            onChange(e);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        // min={inputMin}
        {...rest}
      />
      {customButton && customButton}
      {rightIcon && <span className={s.input__currency}>{rightIcon}</span>}
    </div>
  );
};

export default memo(CustomInput);
