import Api from './Api';

// Download document by ID
export const downloadFileById = async (type,id) => {
    try {
      const response = await Api.get(`download/file/${type}/${id}`, {
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

  export const downloadFileToBrowserById = async (type,id) => {
    try {
      const response = await Api.get(`download/file/${type}/${id}`, {
        responseType: 'blob'
      });
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'document';

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch != null && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  };

  export async function FetchStreamToken(type,id) {
    try {
      const response = await Api.get(`/download/generatetoken/${type}/${id}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  }