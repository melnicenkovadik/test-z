import React, { useCallback, useEffect, useRef } from "react";

interface ClickOutsideProps {
  onClickOutside: () => void;
  children: React.ReactNode;
  exceptionClassNames?: string[]; // классы для исключений
}

const ClickOutside: React.FC<ClickOutsideProps> = ({
  onClickOutside,
  children,
  exceptionClassNames = [],
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;

      const target = event.target as HTMLElement;
      if (
        exceptionClassNames.some((className) =>
          target.classList.contains(className),
        )
      ) {
        return;
      }

      onClickOutside();
    },
    [exceptionClassNames, onClickOutside],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exceptionClassNames, handleClickOutside]);

  return <div ref={ref}>{children}</div>;
};

export default ClickOutside;
