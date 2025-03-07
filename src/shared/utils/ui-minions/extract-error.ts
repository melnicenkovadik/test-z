const isError = (e: Error): e is Error => {
  return !!(e && e.stack && e.message);
};

export const extractError = (err: unknown): string => {
  if (typeof err === "string") {
    return err;
  }
  if (err instanceof Error || isError(err as never)) {
    const message = (err as Error).message || "";
    if (
      message.toLowerCase().indexOf("user rejected action") !== -1 ||
      message.toLowerCase().indexOf("user rejected") !== -1
    ) {
      return "Action rejected by User";
    }
    if (message === "SignatureExpired") {
      return "Signature expired! Please adjust the time in your device.";
    }
    return message;
  }
  return "";
};
