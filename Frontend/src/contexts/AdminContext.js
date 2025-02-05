import { createContext } from 'react';

const AdminContext = createContext({
  admin: null,
  setAdmin: () => {}
});

export default AdminContext;