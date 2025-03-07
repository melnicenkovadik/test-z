import clsx from "clsx";
import { FC } from "react";

import { useDirectionStore } from "@/containers/trade/components/LeftPanel/DirectionPicker/direction.store";
import { DIRECTION_TYPE } from "@/containers/trade/components/LeftPanel/trade-panel.types";

import s from "./direction-picker.module.scss";

interface IDirectionPicker {
  isMini?: boolean;
}

const DirectionPicker: FC<IDirectionPicker> = ({ isMini = false }) => {
  const { direction, setDirection } = useDirectionStore();

  return (
    <div className={clsx(s.direction_picker, { [s.mini]: isMini })}>
      <div
        className={clsx(
          s.direction_picker_item,
          s.direction_picker_item__long,
          {
            [s.active]: !isMini && direction === DIRECTION_TYPE.long,
          },
        )}
        onClick={() => setDirection(DIRECTION_TYPE.long)}
      >
        Long
      </div>
      <div
        className={clsx(
          s.direction_picker_item,
          s.direction_picker_item__short,
          {
            [s.active]: !isMini && direction === DIRECTION_TYPE.short,
          },
        )}
        onClick={() => setDirection(DIRECTION_TYPE.short)}
      >
        Short
      </div>
    </div>
  );
};

export default DirectionPicker;
