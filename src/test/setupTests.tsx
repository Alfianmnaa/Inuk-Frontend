import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import type { ReactElement, ReactNode } from 'react';
import { render as libraryRender } from '@testing-library/react';

export * from '@testing-library/react';

function WrapperComponent({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}

export function render(ui: ReactElement, { wrapper: Wrapper = WrapperComponent, ...options } = {}) {
  return libraryRender(ui, { wrapper: Wrapper, ...options });
}

export { libraryRender };
