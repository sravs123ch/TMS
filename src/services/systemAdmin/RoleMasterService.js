// src/services/roleService.js
import Api from '../Api';

// Fetch all roles with pagination and search
export const fetchAllRoles = async (pageNumber = 1, itemsPerPage = 10, searchText = null) => {
  const offset = (pageNumber - 1) * itemsPerPage;
  try {
    const response = await Api.post('role/get', {
      page: { offset: offset, fetch: itemsPerPage },
      searchText: searchText
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

// Fetch roles with pagination and search
export const fetchRolesWithSearch = async (offset = 0, fetch = 10, searchText = '') => {
  try {
    const response = await Api.post('/role/get', {
      searchText,
      page: {
        offset,
        fetch
      }
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};



// Create a new role
export const createRole = async (payload) => {
  try {
    const response = await Api.post('role/create', payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

// Update an existing role
export const updateRole = async (payload) => {
  try {
    const response = await Api.post('role/update', payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};

export const deleteRole = async (roleID) => {
  try {
    const response = await Api.post('role/delete', { roleID });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw error;
    }
  }
};