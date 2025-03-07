"use client";
import { clsx } from "clsx";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  useState,
  useRef,
  useEffect,
  FC,
  memo,
  useCallback,
} from "react";

import SelectMarketTrigger from "@/containers/trade/components/InfoData/components/SelectMarketTrigger";
import { useMarketTableData } from "@/containers/trade/components/InfoData/components/useMarketTableData";
import { MarketUI } from "@/services/markets/types";
import NoData from "@/shared/components/NoData/noData";
import CustomInput from "@/shared/components/ui/Input";
import { useMarketsQuery } from "@/shared/hooks/useMarketsSWR";

import s from "./SelectMarket.module.scss";

export interface IBaseSelectOption {
  value: MarketUI;
  label: string;
  icon: string | undefined;
}

interface SelectMarketProps {}

const MarketsTableBody = dynamic(() => import("./MarketsTableBody"), {
  ssr: false,
  loading: () => <p>Loading table...</p>,
});
const MarketsTableHeader = dynamic(() => import("./MarketsTableHeader"), {
  ssr: false,
});

const SelectMarket: FC<SelectMarketProps> = () => {
  const [isDisabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // 1. Тогл (переключатель) – отображаем в долларе или в токене.
  const [isTokenMode, setIsTokenMode] = useState(true);

  const {
    setSelectedMarket,
    value,
    setValue,
    searchMarketInput,
    setSearchMarketInput,
    MARKETS_TABLE_DATA,
    table,
  } = useMarketTableData({ isTokenMode });

  const { refetch } = useMarketsQuery();

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    },
    [setIsOpen],
  );

  const debouncedSearchChange = useCallback(
    (value: string) => setSearchMarketInput(value),
    [setSearchMarketInput],
  );

  const handleSelect = useCallback(
    (option: IBaseSelectOption) => {
      setSelectedMarket(option.value);
      setValue(option);
      setIsOpen(false);
    },
    [setSelectedMarket, setValue, setIsOpen],
  );

  const handleOpen = useCallback(
    (value: boolean) => {
      if (value) {
        refetch();
      }
      setIsOpen(value);
    },
    [refetch, setIsOpen],
  );

  const handleSearchMarket = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchChange(e.target.value);
    },
    [debouncedSearchChange],
  );

  return (
    <div
      ref={selectRef}
      className={clsx(s.select, {
        [s.select__disabled]: isDisabled,
      })}
    >
      <SelectMarketTrigger
        value={value}
        isOpen={isOpen}
        setIsOpen={handleOpen}
      />

      {isOpen && (
        <div className={s.select__content}>
          {/* TITLE */}
          <div className={s.select__content__heading}>
            <p>Perpetual Futures</p>
            <Image
              width={24}
              height={24}
              onClick={() => setIsOpen(false)}
              src={"assets/icons/markets_close.svg"}
              alt={"icon"}
            />
          </div>

          {/* SEARCH INPUT */}
          <div className={s.search_wrapper}>
            <CustomInput
              isNumber={false}
              value={searchMarketInput}
              onChange={handleSearchMarket}
              placeholder="Search market"
              inputClassName={s.select__search}
              leftIcon={
                <Image
                  width={20}
                  height={20}
                  src={"assets/icons/search_input_icon.svg"}
                  alt={"icon"}
                />
              }
            />
          </div>

          {/* TABLE */}
          <div className={s.table_wrapper}>
            <MarketsTableHeader
              table={table}
              isTokenMode={isTokenMode}
              setIsTokenMode={setIsTokenMode}
            />
            {MARKETS_TABLE_DATA?.length === 0 ? (
              <NoData />
            ) : (
              <MarketsTableBody
                handleSelectMarket={handleSelect}
                table={table}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SelectMarket);
