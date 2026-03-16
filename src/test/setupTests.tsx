import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import type { ReactElement, ReactNode } from 'react';
import { render as libraryRender, RenderOptions } from '@testing-library/react';

function WrapperComponent({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}

export function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return libraryRender(ui, { wrapper: WrapperComponent, ...options });
}

export { libraryRender as unmountComponentAtNode };
