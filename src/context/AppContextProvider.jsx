
import { UserProvider } from "./UserContext";
import { DepartmentProvider } from './DepartmentContext';
import { DesignationProvider } from './DesignationContext';
import { RoleProvider } from './RoleContext';
const AppContextProvider = ({ children }) => {
  return (
    <UserProvider>
     <DepartmentProvider>
      <DesignationProvider>
        <RoleProvider>
      {children}
      </RoleProvider>
      </DesignationProvider>
    </DepartmentProvider>
    </UserProvider>
  );
};

export default AppContextProvider;
