module.exports = {
  siteUrl:
    process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ? "https://app.zeuz.trade"
      : "https://dev.app.zeuz.trade",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow:
          process.env.NEXT_PUBLIC_NODE_ENV === "production" ? [] : ["/"],
      },
    ],
  },
};
