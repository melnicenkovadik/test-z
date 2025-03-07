export type Modes = {
  icon: any;
  displayValue: string;
  code: ModeCodeType;
};

export type ThemeSelectorProps = {
  onModeChanged: (modeCode: ModeCodeType) => void;
  modes: Modes[];
  iconClose?: any;
  selectedMode?: string;
  selectedAccent?: string;
};

export type ModeCodeType = "dark" | "light" | "auto";
