import { useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { useTradePermissionStore } from "@/shared/components/TradePermission/useTradePermissionStore";
import { useRequireAuthFlow } from "@/shared/hooks/useRequireAuthFlow";
import { useEthersSigner } from "@/shared/hooks/walletUtils";

export const useGrantConditionalOrdersPermissionEmbeddedWalletMutation = (
  marginAccountId: number | null | undefined,
) => {
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });
  const {
    isTradePermissionGrantedForEmbeddedWallet,
    isGrantTradePermissionLoadingForEmbeddedWallet,
    grantPermissionErrorForEmbeddedWallet,
    grantTradePermissionToEmbeddedWallet,
    checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet,
  } = useTradePermissionStore();

  const { requireAuth } = useRequireAuthFlow({
    showCustomModal: true,
  });
  const { addNotification } = useNotifications();

  /**
   * Вызываем grantTradePermissionToEmbeddedWallet из zustand-стора
   */
  const handleGrantTradePermission = async () => {
    // Проверка на авторизацию (если нет, триггерим authFlow)
    if (requireAuth()) {
      return;
    }

    if (!marginAccountId) {
      const error = new Error("Invalid accountId!");
      addNotification({
        title: error.message || "Error granting permission",
        type: "error",
        statusText: "// Error",
      });
      return;
    }

    if (!signer) {
      const error = new Error("Invalid signer!");
      addNotification({
        title: error.message || "Error granting permission",
        type: "error",
        statusText: "// Error",
      });
      return;
    }

    try {
      // @ts-ignore
      await grantTradePermissionToEmbeddedWallet({ signer });
    } catch (e) {
      // Логировать/обрабатывать можно здесь или в zustand-сторе
      console.error(e);
    }
  };

  return {
    isTradePermissionGrantedForEmbeddedWallet,
    isGrantTradePermissionLoadingForEmbeddedWallet,
    grantPermissionErrorForEmbeddedWallet,
    grantTradePermission: handleGrantTradePermission,
    checkIsConditionalOrdersPermissionGrantedToEmbeddedWallet,
  };
};
