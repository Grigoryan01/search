import type { ReactNode } from 'react';

type MainProps = {
  children: ReactNode;
};

export const Main = ({ children }: MainProps) => (
  <main className="grid gap-5">{children}</main>
);
