const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("vedantaastro-admin-token");
  }
  return null;
};

export const header = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});
