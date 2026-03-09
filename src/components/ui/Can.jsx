import { useAuth } from '../../contexts/authContext';

export default function Can({ permission, fallback = null, children }) {
  const { can } = useAuth();
  return can(permission) ? children : fallback;
}