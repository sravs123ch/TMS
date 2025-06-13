import Api from '../../services/Api';

export async function fetchOJTByUserId(payload) {
  try {
    const response = await Api.post('/onjobtraining/getbyuserid', payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function deleteOJTById(ojtid, modifiedBy) {
  try {
    const response = await Api.post('/onjobtraining/delete', {
      ojtid,
      modifiedBy,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function createOJT(formData, file, userId, createdBy) {
  try {
    const data = new FormData();
    data.append('OnJobTrainingTitle', formData.ojtTitle);
    data.append('OnJobTrainingCode', formData.ojtCode);
    data.append('UserID', userId);
    data.append('NoOfSet', parseInt(formData.numberOfSets, 10));
    data.append('ExpectedDuration', parseInt(formData.expectedDuration, 10) || 0); // Handle empty duration
    // Join activity details array into a single string (e.g., with newlines)
    // data.append('ActivityDetails', formData.activityDetails.join('\n'));
    formData.activityDetails.forEach(item => {
      data.append('ActivityDetails', item);
    });
    data.append('Remarks', formData.remarks);
    data.append('EvaluationType', formData.evaluationType);
    data.append('ActivitySteps', parseInt(formData.activitySteps, 10));
    // Assuming PlantID comes from session storage or a default
    data.append('PlantID', sessionStorage.getItem('plantID') || '0'); // Using default 0 as per curl example
    // Add a placeholder SignatureDate - backend might expect a datetime
    // This might need to be a form field if the date is user-provided
    data.append('SignatureDate', new Date().toISOString()); // Sending current datetime as ISO string
    data.append('CreatedBy', createdBy);

    // Append file if it exists
    if (file) {
        data.append('file', file);
        data.append('AssociatedDocumentExtention', formData.associatedDocumentExtension); // Use correct key from curl
        // Do not append AssociatedDocumentPath, backend likely handles it
    }

    const response = await Api.post('/onjobtraining/create', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
            // X-Plant-Id and Authorization should be handled by the Api service globally
        },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
  export async function updateOJTStatus({ onJobTrainingID, ojtStatus, modifiedBy, reasonForChange }) {
    try {
      const response = await Api.post('/onjobtraining/updatestatus', {
        onJobTrainingID,
        ojtStatus,
        modifiedBy,
        reasonForChange
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      } else {
        throw error;
      }
    }
}

export async function fetchOJTById(ojtId) {
    try {
      // Assuming the backend has an endpoint to fetch by ID, let's use a GET request pattern
      // If a GET endpoint by ID doesn't exist, we might need to adapt fetchOJTByUserId
      // or assume the update endpoint response includes the updated data.
      // For now, let's assume a GET by ID endpoint like '/onjobtraining/{ojtId}' exists.
      // If not, this will need adjustment based on actual backend capabilities.
      const response = await Api.get(`/onjobtraining/${ojtId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  }

export async function updateOJT(ojtId, formData, file, modifiedBy, reasonForChange) {
    try {
      const data = new FormData();
      data.append('OnJobTrainingID', ojtId);
      data.append('OnJobTrainingTitle', formData.ojtTitle);
      data.append('ModifiedBy', modifiedBy);
      // AssociatedDocumentPath is likely handled by backend based on file upload
      data.append('SignatureDate', new Date().toISOString()); // Use current datetime as placeholder
      data.append('NoOfSet', parseInt(formData.numberOfSets, 10));
      data.append('ExpectedDuration', parseInt(formData.expectedDuration, 10) || 0);

      // Append multiple ActivityDetails
      formData.activityDetails.forEach(item => {
        data.append('ActivityDetails', item);
      });

      data.append('Remarks', formData.remarks);
      data.append('ReasonForChange', reasonForChange);
      data.append('EvaluationType', formData.evaluationType);
      data.append('ActivitySteps', formData.activityDetails.length); // Send actual count
      // ElectronicSignature might need to be handled - assuming string for now or handled by backend
      data.append('ElectronicSignature', 'system_signature'); // Placeholder

      // Append file if it exists
      if (file) {
          data.append('file', file);
          data.append('AssociatedDocumentExtention', formData.associatedDocumentExtension); // Use correct key from curl
          // Do not append AssociatedDocumentPath, backend likely handles it
      }

      const response = await Api.post('/onjobtraining/update', data, {
          headers: {
              'Content-Type': 'multipart/form-data'
              // X-Plant-Id and Authorization should be handled by the Api service globally
          },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  }


  // Download document by ID
export const onjobtrainingDownloadById = async (documentId) => {
  try {
    const response = await Api.get(`onjobtraining/download/${documentId}`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};