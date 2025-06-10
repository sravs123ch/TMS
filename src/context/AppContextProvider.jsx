
import { UserProvider } from "./UserContext";
import { DepartmentProvider } from './DepartmentContext';
const AppContextProvider = ({ children }) => {
  return (
    <UserProvider>
     <DepartmentProvider>
      {children}
    </DepartmentProvider>
    </UserProvider>
  );
};

export default AppContextProvider;
