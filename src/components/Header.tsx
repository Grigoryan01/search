type HeaderProps = {
  title: string;
};

export const Header = ({ title }: HeaderProps) => (
  <header>
    <h1 className="mb-5 text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
      {title}
    </h1>
  </header>
);
