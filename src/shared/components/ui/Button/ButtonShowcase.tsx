"use client";
import { Button } from "@/shared/components/ui/Button/button";
import { Typography } from "@/shared/components/ui/Typography";

const ButtonShowcase = () => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <Typography color="white" size={"heading5"} tag="h2" underline>
        Button Variants
      </Typography>
      <div
        style={{
          display: "flex",
          width: "fit-content",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <Typography color="white" size={"heading5"} tag="h2" underline>
        Button Sizes
      </Typography>
      <div
        style={{
          display: "flex",
          width: "fit-content",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>

      <Typography color="white" size={"heading5"} tag="h2" underline>
        Button with Icons
      </Typography>

      <div
        style={{
          display: "flex",
          width: "fit-content",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Button variant="primary">Button with Icon</Button>
        <Button variant="secondary">Button with Icon</Button>
      </div>
    </div>
  );
};

export default ButtonShowcase;
