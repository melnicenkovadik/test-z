import { useChainId } from "wagmi";

import { useNotifications } from "@/providers/notifications/useNotifications";
import { useTradePermissionStore } from "@/shared/components/TradePermission/useTradePermissionStore"; // Путь к zustand-store
import { useRequireAuthFlow } from "@/shared/hooks/useRequireAuthFlow";
import { useEthersSigner } from "@/shared/hooks/walletUtils";
import useUserStore from "@/shared/store/user.store";

export const useGrantConditionalOrdersPermissionMutation = (
  marginAccountId: number | null | undefined,
) => {
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });

  const {
    isTradePermissionGranted,
    isGrantTradePermissionLoading,
    grantPermissionError,
    grantTradePermission,
    checkIsConditionalOrdersPermissionGranted,
  } = useTradePermissionStore();

  const { requireAuth } = useRequireAuthFlow({
    showCustomModal: true,
  });
  const { addNotification } = useNotifications();

  const handleGrantTradePermission = async () => {
    if (requireAuth()) {
      return;
    }
    if (!marginAccountId) {
      const error = new Error("Invalid accountId!");
      return addNotification({
        title: error.message || "Error granting permission",
        type: "error",
        statusText: "// Error",
      });
    }
    if (!signer) {
      const error = new Error("Invalid signer!");
      return addNotification({
        title: error.message || "Error granting permission",
        type: "error",
        statusText: "// Error",
      });
    }
    console.log(useUserStore?.getState()?.ownerMetadata?.address);
    await grantTradePermission({
      signer,
    });
  };
  return {
    grantPermissionError,
    grantTradePermission: handleGrantTradePermission,
    isGrantTradePermissionLoading,
    isTradePermissionGranted,
    checkIsConditionalOrdersPermissionGranted,
  };
};

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

  const handleGrantTradePermission = async () => {
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

// Новые хуки для revoke

export const useRevokeConditionalOrdersPermissionMutation = (
  marginAccountId: number | null | undefined,
) => {
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });

  const {
    isRevokeTradePermissionLoading,
    revokePermissionError,
    revokeTradePermission,
  } = useTradePermissionStore();

  const { requireAuth } = useRequireAuthFlow({ showCustomModal: true });
  const { addNotification } = useNotifications();

  const handleRevokeTradePermission = async () => {
    if (requireAuth()) {
      return;
    }
    if (!marginAccountId) {
      const error = new Error("Invalid accountId!");
      return addNotification({
        title: error.message || "Error revoking permission",
        type: "error",
        statusText: "// Error",
      });
    }
    if (!signer) {
      const error = new Error("Invalid signer!");
      return addNotification({
        title: error.message || "Error revoking permission",
        type: "error",
        statusText: "// Error",
      });
    }
    try {
      // @ts-ignore
      await revokeTradePermission({ signer });
    } catch (e) {
      console.error(e);
    }
  };

  return {
    revokePermissionError,
    revokeTradePermission: handleRevokeTradePermission,
    isRevokeTradePermissionLoading,
  };
};

export const useRevokeConditionalOrdersPermissionEmbeddedWalletMutation = (
  marginAccountId: number | null | undefined,
) => {
  const currentChain = useChainId();
  const signer = useEthersSigner({ chainId: currentChain });

  const {
    isRevokeTradePermissionLoadingForEmbeddedWallet,
    revokePermissionErrorForEmbeddedWallet,
    revokeTradePermissionToEmbeddedWallet,
  } = useTradePermissionStore();

  const { requireAuth } = useRequireAuthFlow({ showCustomModal: true });
  const { addNotification } = useNotifications();

  const handleRevokeTradePermission = async () => {
    if (requireAuth()) {
      return;
    }
    if (!marginAccountId) {
      const error = new Error("Invalid accountId!");
      addNotification({
        title: error.message || "Error revoking permission",
        type: "error",
        statusText: "// Error",
      });
      return;
    }
    if (!signer) {
      const error = new Error("Invalid signer!");
      addNotification({
        title: error.message || "Error revoking permission",
        type: "error",
        statusText: "// Error",
      });
      return;
    }
    try {
      // @ts-ignore
      await revokeTradePermissionToEmbeddedWallet({ signer });
    } catch (e) {
      console.error(e);
    }
  };

  return {
    isRevokeTradePermissionLoadingForEmbeddedWallet,
    revokePermissionErrorForEmbeddedWallet,
    revokeTradePermission: handleRevokeTradePermission,
  };
};
