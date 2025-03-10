"use client";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from "react";

import "./methods.css";
import { SafeStringify } from "@/shared/components/Methods/dynamic-methods.types";

interface IDynamicMethods {
  isDarkMode: boolean;
  showHelp?: boolean;
}

export default function DynamicMethods({
  isDarkMode,
  showHelp = false,
}: IDynamicMethods) {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
  const userWallets = useUserWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    if (sdkHasLoaded && isLoggedIn && primaryWallet) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

  if (!showHelp) {
    return null;
  }

  const safeStringify: SafeStringify = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      },
      2,
    );
  };

  function clearResult() {
    setResult("");
  }

  function showUser() {
    setResult(safeStringify(user));
  }

  function showUserWallets() {
    setResult(safeStringify(userWallets));
  }

  async function fetchPublicClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    const publicClient = await primaryWallet.getPublicClient();
    setResult(safeStringify(publicClient));
  }

  async function fetchWalletClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    const walletClient = await primaryWallet.getWalletClient();
    setResult(safeStringify(walletClient));
  }

  async function signEthereumMessage() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

    const signature = await primaryWallet.signMessage("Hello World");
    setResult(signature as string);
  }

  return (
    <>
      {!isLoading ? (
        <div
          className="dynamic-methods"
          data-theme={isDarkMode ? "dark" : "light"}
        >
          <div className="methods-container">
            <button className="btn btn-primary" onClick={showUser}>
              Fetch User
            </button>
            <button className="btn btn-primary" onClick={showUserWallets}>
              Fetch User Wallets
            </button>

            {primaryWallet && isEthereumWallet(primaryWallet) && (
              <>
                <button className="btn btn-primary" onClick={fetchPublicClient}>
                  Fetch Public Client
                </button>
                <button className="btn btn-primary" onClick={fetchWalletClient}>
                  Fetch Wallet Client
                </button>
                <button
                  className="btn btn-primary"
                  onClick={signEthereumMessage}
                >
                  Sign - Hello World - on Ethereum
                </button>
              </>
            )}
          </div>
          {result && (
            <div className="results-container">
              <pre className="results-text">{result}</pre>
            </div>
          )}
          {result && (
            <div className="clear-container">
              <button className="btn btn-primary" onClick={clearResult}>
                Clear
              </button>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
