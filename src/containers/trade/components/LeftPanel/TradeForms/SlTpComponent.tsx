import clsx from "clsx";
import { FC } from "react";

import s from "@/containers/trade/components/LeftPanel/TradeForms/trade-forms.module.scss";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import CustomInput from "@/shared/components/ui/Input";
import { priceFormatter } from "@/shared/utils/ui-minions";

interface ISlTpComponentProps {
  info: any;
  stopLoss: any;
  setStopLoss: any;
  errors: any;
  takeProfit: any;
  setTakeProfit: any;
  isTrading: any;
  maxAvailableOrderSize: any;
  toggleShow: any;
  setToggleShow: any;
  disabled?: boolean;
}

const SlTpComponent: FC<ISlTpComponentProps> = ({
  info,
  stopLoss,
  setStopLoss,
  errors,
  takeProfit,
  setTakeProfit,
  isTrading,
  maxAvailableOrderSize,
  toggleShow,
  setToggleShow,
  disabled = false,
}) => {
  const handleToggleShow = () => {
    // @ts-ignore
    setToggleShow((prev) => {
      if (prev === false) {
        setStopLoss("");
        setTakeProfit("");
      }
      return !prev;
    });
  };

  return (
    <div
      className={clsx(s.sltp_form, {
        [s.disabled]: disabled,
      })}
    >
      <Checkbox
        label="Stop Loss / Take Profit"
        checked={toggleShow}
        className={s.stop_loss__checkbox}
        onCheckedChange={handleToggleShow}
        disabled={disabled}
      />
      {toggleShow && (
        <div className={s.stop_loss}>
          <div className={s.stop_loss__label}>
            <p>Stop Loss</p>
            {info?.estimatedStopLossPnL ? (
              <span>
                Est. PnL:{" "}
                <span
                  style={{
                    color:
                      info?.estimatedStopLossPnL &&
                      info?.estimatedStopLossPnL > 0
                        ? "var(--green)"
                        : "var(--red)",
                  }}
                >
                  {info?.estimatedStopLossPnL
                    ? priceFormatter(info?.estimatedStopLossPnL)
                    : "--"}{" "}
                  rUSD
                </span>
              </span>
            ) : null}
          </div>
          <CustomInput
            isNumber
            value={stopLoss}
            error={errors.stopLoss}
            onChange={(e) => {
              setStopLoss(+e.target.value);
            }}
            rightIcon={<div className={s.stop_loss__right_icon}>rUSD</div>}
            disabled={isTrading || !maxAvailableOrderSize}
            placeholder="0.00"
            inputWrapperClassName={s.stop_loss__input}
          />
        </div>
      )}

      {toggleShow ? (
        <div className={s.stop_loss}>
          <div className={s.stop_loss__label}>
            <p>Take Profit</p>
            {info.estimatedTakeProfitPnL ? (
              <span>
                Est. PnL:{" "}
                <span
                  style={{
                    color: info?.estimatedTakeProfitPnL
                      ? info.estimatedTakeProfitPnL > 0
                        ? "var(--green)"
                        : "var(--red)"
                      : "inherit",
                  }}
                >
                  {info.estimatedTakeProfitPnL
                    ? priceFormatter(info.estimatedTakeProfitPnL)
                    : "--"}{" "}
                  rUSD
                </span>
              </span>
            ) : null}
          </div>
          <CustomInput
            isNumber
            rightIcon={<div className={s.stop_loss__right_icon}>rUSD</div>}
            value={takeProfit}
            error={errors.takeProfit}
            onChange={(e) => {
              setTakeProfit(+e.target.value);
            }}
            disabled={isTrading || !maxAvailableOrderSize}
            placeholder="0.00"
            inputWrapperClassName={s.stop_loss__input}
          />
        </div>
      ) : null}
    </div>
  );
};

export default SlTpComponent;
