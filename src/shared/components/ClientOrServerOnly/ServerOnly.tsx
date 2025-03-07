"use server";

type ServerOnlyProps = {
  children: React.ReactNode;
};

const ServerOnly: React.FC<ServerOnlyProps> = ({ children }) => {
  return <>{children}</>;
};

export default ServerOnly;
