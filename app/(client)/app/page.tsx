import React from "react";
import { useSession } from "next-auth/react";

const App = () => {
  const { data: session, status } = useSession();
  console.log("Session Data:", session);
  return <div>App</div>;
};

export default App;
