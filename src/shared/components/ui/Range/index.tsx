import clsx from "clsx";
import {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useDebounce } from "@/shared/hooks/useDebounce";
import { formatNumber } from "@/shared/utils/numberUtils";

import s from "./Range.module.scss";

interface IRangeSlider {
  value: number;
  setValue: (
    value: number,
  ) =>
    | void
    | ((value: number) => void)
    | Dispatch<SetStateAction<string>>
    | Dispatch<SetStateAction<number>>;
  step?: number;
  min?: number | string;
  max?: number | string;
  isClosestMark?: boolean;
  suffix?: string;
  disabled?: boolean;
  showMarks?: boolean;
}

const RangeSlider: FC<IRangeSlider> = ({
  value,
  setValue,
  step = 1,
  min = 0,
  max = 100,
  suffix = "",
  disabled,
  showMarks = true,
}) => {
  const [[rangeMin, rangeMax], setRange] = useState([min, max]);
  const marks = useRef<string[]>([min.toString(), max.toString()]);

  useEffect(() => {
    const diff = +max - +min;
    const marksStep = Math.ceil(diff / 5);
    const newMarks = Array.from({ length: 5 }, (_, i) => {
      const mark = +min + i * marksStep;
      return mark > +max ? +max - 1 : mark - 1;
    });
    const unniqueMarks = Array.from(
      new Set(
        [
          ...newMarks.map((mark) => formatNumber(+mark)),
          formatNumber(+max),
        ]?.filter(Boolean) || [],
      ),
    );
    marks.current = unniqueMarks;
  }, [min, max]);

  const [rangeValue, setRangeValue] = useState(value);
  const [isPressed, setIsPressed] = useState(false);
  const debounceRangeValue = useDebounce(rangeValue, 300);

  useEffect(() => {
    if (min && max) {
      if (+min > +max) {
        setRange([min, min]);
      } else {
        setRange([min, max]);
      }
    } else {
      setRange([0, 0]);
    }
  }, [min, max, disabled, suffix, value]);

  const onSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      setRangeValue(Number(e.target.value));
    },
    [disabled],
  );

  useEffect(() => {
    if (isPressed) return;
    setValue(debounceRangeValue);
  }, [debounceRangeValue, isPressed]);

  useEffect(() => {
    setRangeValue(value);
  }, [value, disabled]);

  const onMouseEnter = useCallback(() => {
    setIsPressed(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);
  return (
    <div className={s["slider-container"]}>
      <input
        type="range"
        value={rangeValue}
        step={step}
        min={rangeMin || 0}
        max={rangeMax}
        disabled={disabled || rangeMin == rangeMax}
        onChange={onSliderChange}
        onPointerDown={onMouseEnter}
        onPointerUp={onMouseLeave}
        className={clsx(s["slider"], {
          [s["slider--disabled"]]: disabled,
        })}
        style={{
          background: `linear-gradient(to right, #AEB0BA ${
            ((rangeValue - +rangeMin) / (+max - +rangeMin)) * 100
          }%, #303239 ${((rangeValue - +rangeMin) / (+max - +rangeMin)) * 100}%)`,
        }}
      />
      <SliderMarks
        rangeMin={rangeMin}
        rangeMax={rangeMax}
        marks={marks?.current}
      />
      {showMarks ? (
        <SliderLabels
          marks={marks?.current}
          rangeMin={rangeMin}
          rangeMax={rangeMax}
          suffix={suffix}
        />
      ) : null}
    </div>
  );
};

const SliderLabels: FC<{
  marks: string[];
  rangeMin: number | string;
  rangeMax: number | string;
  suffix: string;
}> = ({ marks, rangeMin, rangeMax, suffix }) => {
  const validMin = Math.min(+rangeMin, +rangeMax);
  const validMax = Math.max(+rangeMin, +rangeMax);
  const newMarks = marks.map((mark) => {
    if (+mark === 0) return 1;
    return mark;
  });

  return (
    <div className={s.slider_labels}>
      {newMarks.map((mark, ind) => {
        const position = ((+mark - +validMin) / (+validMax - +validMin)) * 100;
        return (
          <span
            key={ind}
            style={{
              opacity: +validMin === +validMax && ind === 1 ? 0 : 1,
              position: "absolute",
              left: `${position}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span>
              {Math.ceil(+mark)}&nbsp;
              <span>{suffix}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
};
const SliderMarks: FC<{
  rangeMin?: number | string | undefined;
  rangeMax?: number | string | undefined;
  marks?: string[];
}> = ({ rangeMin, rangeMax, marks }) => {
  if (!rangeMin || !rangeMax || !marks) return null;
  const newMarks = marks.map((mark) => {
    if (+mark === 0) return 1;
    return mark;
  });
  return (
    <div className={s["slider-marks"]}>
      {newMarks?.map((mark) => {
        const position = ((+mark - +rangeMin) / (+rangeMax - +rangeMin)) * 100;
        return (
          <span
            key={mark}
            className={s["slider-mark"]}
            style={{
              left: `${position}%`,
            }}
          />
        );
      })}
    </div>
  );
};
export default memo(RangeSlider);
