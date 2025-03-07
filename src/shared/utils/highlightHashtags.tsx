import { ReactElement } from "react";

export const highlightHashtags = (text: string): ReactElement => {
  if (!text || !text.includes("#")) {
    return <>{text}</>;
  }

  return (
    <>
      {text.split(" ").map((word, index) =>
        word.startsWith("#") ? (
          <span
            key={`hashtag-${index}`}
            style={{
              color: "lightblue",
            }}
          >
            {word}{" "}
          </span>
        ) : (
          <span key={`word-${index}`}>{word} </span>
        ),
      )}
    </>
  );
};
