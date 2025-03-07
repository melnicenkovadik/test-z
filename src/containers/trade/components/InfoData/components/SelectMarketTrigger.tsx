import clsx from "clsx";
import Image from "next/image";
import React, { FC } from "react";

import s from "@/containers/trade/components/InfoData/components/SelectMarket.module.scss";

import { getIcon } from "../../../../../../public/assets/icons/coins/avalible_icons";

interface ISelectMarketTrigger {
  value: any;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SelectMarketTrigger: FC<ISelectMarketTrigger> = ({
  value,
  isOpen,
  setIsOpen,
}) => {
  return (
    <div className={clsx(s.select__trigger)} onClick={() => setIsOpen(!isOpen)}>
      {value ? (
        <div className={s.select__selected}>
          {value.icon && (
            <Image
              src={getIcon(value.icon) || ""}
              alt={value?.label || "Icon"}
              width={24}
              height={24}
              className={s.select__icon}
            />
          )}
          <span>{value.label}</span>
        </div>
      ) : (
        <span>Select Market</span>
      )}
      <Image
        className={s.select__icon__arrow}
        src="/assets/icons/arr_down.svg"
        alt="Arrow down"
        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
        width={16}
        height={16}
      />
    </div>
  );
};

export default SelectMarketTrigger;
