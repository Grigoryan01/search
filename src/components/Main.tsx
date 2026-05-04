import { Component, type ReactNode } from 'react';

type MainProps = {
  children: ReactNode;
};

export class Main extends Component<MainProps> {
  render() {
    return <main className="grid gap-5">{this.props.children}</main>;
  }
}
