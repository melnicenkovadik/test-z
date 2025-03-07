import clsx from "clsx";
import React, { FC, useCallback } from "react";

import s from "./trade-forms.module.scss";

interface IPercentageButtons {
  amount: any;
  setAmount: any;
  maxValue: any;
  disabled: boolean;
  min: any;
}

const PercentageButtons: FC<IPercentageButtons> = ({
  amount,
  setAmount,
  maxValue,
  disabled,
  min,
}) => {
  const percentageButtons = [10, 20, 50, 100];
  const [lastActiveButtonValue, setLastActiveButtonValue] = React.useState<
    number | null
  >(null);
  const setPercentage = (percentage: number) => {
    setAmount((maxValue * percentage) / 100);
    setLastActiveButtonValue((maxValue * percentage) / 100);
  };
  const percentageButton = useCallback(
    (percentage: number) => {
      return (
        <button
          key={percentage}
          className={clsx(s.percentage_button, {
            [s.percentage_button_active]: lastActiveButtonValue
              ? +amount === +((maxValue * percentage) / 100)
              : false,
          })}
          onClick={() => setPercentage(percentage)}
          disabled={disabled || min > +(maxValue * percentage) / 100}
        >
          {percentage}%
        </button>
      );
    },
    [amount, maxValue, disabled, lastActiveButtonValue],
  );

  return (
    <div className={s.percentage_buttons}>
      {percentageButtons.map(percentageButton)}
    </div>
  );
};

export default PercentageButtons;
