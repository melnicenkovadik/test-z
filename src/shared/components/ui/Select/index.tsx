"use client";
import { clsx } from "clsx";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

import s from "./CustomSelect.module.scss";

export interface IBaseSelectOption {
  value: any;
  label: any;
  icon?: string;
}

interface CustomSelectProps<T extends IBaseSelectOption> {
  options: T[];
  value: any;
  onChange: (option: IBaseSelectOption) => void;
  placeholder: string;
  isDisabled?: boolean;
  className?: string;
  updated?: boolean;
  selectContentClassName?: string;
  selectLabelClassName?: string;
}

const CustomSelect = <T extends IBaseSelectOption>({
  options,
  value,
  onChange,
  placeholder,
  isDisabled,
  className = undefined,
  updated = false,
  selectContentClassName,
  selectLabelClassName,
}: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: T) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={selectRef}
      className={clsx(
        s.select,
        {
          [s.select__disabled]: isDisabled,
        },
        className,
      )}
    >
      <div
        className={clsx(s.select__trigger, selectLabelClassName, {
          [s.select__trigger_updated]: updated,
        })}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <div className={s.select__selected}>
            {value.icon && (
              <Image
                src={value.icon}
                alt={value.label}
                width={16}
                height={16}
                className={s.select__icon}
              />
            )}
            <span>{value.label}</span>
          </div>
        ) : (
          <span>{placeholder}</span>
        )}
        {!updated ? (
          <Image
            className={s.select__icon__arrow}
            src="/assets/icons/arr_down.svg"
            alt="Arrow down"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
            width={16}
            height={16}
          />
        ) : (
          <Image
            className={s.select__icon__arrow}
            src="/assets/icons/updated_arr_down.svg"
            alt="Arrow down"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
            width={16}
            height={16}
          />
        )}
      </div>
      {isOpen && (
        <div className={clsx(s.select__content, selectContentClassName)}>
          {options.map((option) => (
            <div
              key={option?.value?.id || option?.label}
              className={s.select__item}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              <div className={s.select__item_content}>
                {option?.icon && (
                  <Image
                    width={24}
                    height={24}
                    src={option?.icon}
                    alt={"icon"}
                    className={s.select__item_content__icon}
                  />
                )}
                <span>{option.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
