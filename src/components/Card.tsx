import { Component } from 'react';
import type { Product } from '../types';

type CardProps = {
  item: Product;
};

export class Card extends Component<CardProps> {
  render() {
    const { item } = this.props;

    return (
      <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
        <p className="m-0 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.description}</p>
      </article>
    );
  }
}
