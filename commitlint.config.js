module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      issuePrefixes: ["#"],
    },
  },
  rules: {
    "references-empty": [0],
    "subject-case": [0],
    "scope-enum": [
      2,
      "always",
      ["wip", "configs", "formatting", "code", "deployment", "tests"],
    ],
  },
};
