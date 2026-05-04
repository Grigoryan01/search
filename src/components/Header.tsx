import { Component } from 'react';

type HeaderProps = {
  title: string;
};

export class Header extends Component<HeaderProps> {
  render() {
    const { title } = this.props;

    return (
      <header>
        <h1 className="mb-5 text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          {title}
        </h1>
      </header>
    );
  }
}
