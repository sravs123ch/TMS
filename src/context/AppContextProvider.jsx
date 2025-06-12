
import { UserProvider } from "./UserContext";
import { DepartmentProvider } from './DepartmentContext';
import { DesignationProvider } from './DesignationContext';
import { RoleProvider } from './RoleContext';
import { PlantProvider } from './PlantContext';
import { PlantAssignProvider } from './PlantAssignContext';
const AppContextProvider = ({ children }) => {
  return (
    <UserProvider>
     <DepartmentProvider>
      <DesignationProvider>
        <RoleProvider>
          <PlantProvider>
            <PlantAssignProvider>
      {children}
      </PlantAssignProvider>
      </PlantProvider>
      </RoleProvider>
      </DesignationProvider>
    </DepartmentProvider>
    </UserProvider>
  );
};

export default AppContextProvider;
