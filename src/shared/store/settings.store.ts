import { create } from "zustand";

interface Feature {
  name: string;
  description: string;
  enabled: boolean;
}

interface SettingsState {
  features: Feature[];
  toggleFeature: (featureName: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  features: [
    { name: "theme", description: "Enable Theme Feature", enabled: false },
    {
      name: "language",
      description: "Enable Language Feature",
      enabled: false,
    },
    {
      name: "disableBlocksTrade",
      description: "Disable Blocks Trade",
      enabled: false,
    },
  ],
  toggleFeature: (featureName) =>
    set((state) => ({
      features: state.features.map((feature) =>
        feature.name === featureName
          ? { ...feature, enabled: !feature.enabled }
          : feature,
      ),
    })),
}));
