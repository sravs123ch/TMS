
import { UserProvider } from "./UserContext";
import { DepartmentProvider } from './DepartmentContext';
import { DesignationProvider } from './DesignationContext';
import { RoleProvider } from './RoleContext';
import { PlantProvider } from './PlantContext';
import { PlantAssignProvider } from './PlantAssignContext';
import { JobResponsibilityProvider } from './induction/JobResponsibilityContext';
import { DocumentProvider } from './sopOjt-Management/DocumentContext';
import { QuestionPrepareProvider } from './sopOjt-Management/QuestionPrepareContext';
const AppContextProvider = ({ children }) => {
  return (
    <UserProvider>
     <DepartmentProvider>
      <DesignationProvider>
        <RoleProvider>
          <PlantProvider>
            <PlantAssignProvider>
              <JobResponsibilityProvider>
                <DocumentProvider>
                  <QuestionPrepareProvider>
      {children}
      </QuestionPrepareProvider>
      </DocumentProvider>
      </JobResponsibilityProvider>
      </PlantAssignProvider>
      </PlantProvider>
      </RoleProvider>
      </DesignationProvider>
    </DepartmentProvider>
    </UserProvider>
  );
};

export default AppContextProvider;
