import {
  useUserWallets,
  useEmbeddedWallet,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";

const SwitchToEmbeddedWallet = () => {
  const { createEmbeddedWallet, userHasEmbeddedWallet } = useEmbeddedWallet();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const userWallets = useUserWallets();

  const handleSwitch = async () => {
    try {
      console.log("Подключенные кошельки:", userWallets);

      if (!primaryWallet) {
        console.log(
          "Пользователь не аутентифицирован. Открываем окно авторизации...",
        );
        setShowAuthFlow(true); // Показываем модальное окно логина
        return;
      }

      if (userHasEmbeddedWallet()) {
        alert("У вас уже есть встроенный кошелек.");
        return;
      }

      console.log("Создаём встроенный кошелек...");
      const wallet = await createEmbeddedWallet();
      console.log("wallet", wallet);
      alert("Встроенный кошелек создан!");
    } catch (e) {
      console.error("Ошибка:", e);
    }
  };

  return (
    <button onClick={handleSwitch}>
      {primaryWallet
        ? userHasEmbeddedWallet()
          ? "Использовать встроенный кошелек"
          : "Создать встроенный кошелек"
        : "Войти"}
    </button>
  );
};

export default SwitchToEmbeddedWallet;
