import { createContext } from 'react';
import type { AuthContextType } from '../types/auth';

export const STORAGE_KEY_ACCESS = 'enrivo_auth_access_token';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
