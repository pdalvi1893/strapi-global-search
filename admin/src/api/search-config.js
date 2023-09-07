// admin/src/api/task.js
import axiosInstance from '../../src/utils/axiosInstance';

const taskRequests = {
  getTaskCount: async () => {
    const data = await axiosInstance.get(`/simple-global-search/count`);
    return data;
  },
  getSettings: async () => {
    const data = await axiosInstance.get(`/simple-global-search/settings`);
    return data;
  },
  setSettings: async data => {
    return await axiosInstance.post(`/simple-global-search/settings`, {
      data: data,
    });
  },
};
export default taskRequests;