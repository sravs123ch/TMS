
import { UserProvider } from "./UserContext";

const AppContextProvider = ({ children }) => {
  return (
    <UserProvider>
     
      {children}
    
    </UserProvider>
  );
};

export default AppContextProvider;
