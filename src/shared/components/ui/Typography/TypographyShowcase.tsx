"use client";

import React from "react";

import { Typography } from "@/shared/components/ui/Typography/index";

const TypographyShowcase = () => {
  return (
    <div>
      <h1>Typography Showcase</h1>

      <h2>Text Variants (Sizes)</h2>
      <div>
        <Typography size="heading1">Heading 1 (48px)</Typography>
        <Typography size="heading2">Heading 2 (30px)</Typography>
        <Typography size="heading3">Heading 3 (24px)</Typography>
        <Typography size="heading4">Heading 4 (20px)</Typography>
        <Typography size="heading5">Heading 5 (18px)</Typography>
        <Typography size="body1">Body 1 (16px)</Typography>
        <Typography size="body2">Body 2 (14px)</Typography>
        <Typography size="body3">Body 3 (12px)</Typography>
        <Typography size="body4">Body 4 (10px)</Typography>
      </div>

      <h2>Text Colors</h2>
      <div>
        <Typography color="base-300">Base 300</Typography>
        <Typography color="base-600">Base 600</Typography>
        <Typography color="green">Green</Typography>
        <Typography color="red">Red</Typography>
        <Typography color="accent">Accent</Typography>
        <Typography color="white">White</Typography>
      </div>

      <h2>Text with Hashtags</h2>
      <div>
        <Typography disableHashtagsHighlighting={false}>
          This is a text with a #hashtag.
        </Typography>
        <Typography disableHashtagsHighlighting={true}>
          This is a text without a #hashtag.
        </Typography>
      </div>
    </div>
  );
};

export default TypographyShowcase;
