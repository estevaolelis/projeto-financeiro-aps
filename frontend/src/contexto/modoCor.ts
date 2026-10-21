import { createContext, useContext } from 'react';
import type { ModoCor } from '../tema';

type ContextoModoCor = { modo: ModoCor; alternar: () => void };

export const ContextoModoCor = createContext<ContextoModoCor>({ modo: 'dark', alternar: () => undefined });

export const useModoCor = () => useContext(ContextoModoCor);
