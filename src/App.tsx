import { Component } from 'react';
import { fetchFirstPageProducts } from './api';
import { CardList } from './components/CardList';
import { ErrorMessage } from './components/ErrorMessage';
import { Header } from './components/Header';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Main } from './components/Main';
import { Search } from './components/Search';
import type { Product } from './types';

const SEARCH_STORAGE_KEY = 'searchTerm';

type AppState = {
  inputValue: string;
  lastSubmittedSearch: string;
  items: Product[];
  isLoading: boolean;
  errorMessage: string;
  triggerError: boolean;
};

class App extends Component<object, AppState> {
  state: AppState = {
    inputValue: '',
    lastSubmittedSearch: '',
    items: [],
    isLoading: false,
    errorMessage: '',
    triggerError: false,
  };

  componentDidMount(): void {
    const persistedSearch = localStorage.getItem(SEARCH_STORAGE_KEY)?.trim() ?? '';

    this.setState(
      {
        inputValue: persistedSearch,
        lastSubmittedSearch: persistedSearch,
      },
      () => {
        void this.loadProducts(this.state.lastSubmittedSearch);
      }
    );
  }

  loadProducts = async (searchTerm: string) => {
    this.setState({ isLoading: true, errorMessage: '' });

    try {
      const items = await fetchFirstPageProducts(searchTerm);
      this.setState({ items });
    } catch {
      this.setState({
        items: [],
        errorMessage: 'Unable to load items. Please try again in a moment.',
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleInputChange = (nextValue: string) => {
    this.setState({ inputValue: nextValue });
  };

  handleSearch = () => {
    const trimmedSearch = this.state.inputValue.trim();

    if (trimmedSearch === this.state.lastSubmittedSearch) {
      return;
    }

    localStorage.setItem(SEARCH_STORAGE_KEY, trimmedSearch);

    this.setState(
      {
        inputValue: trimmedSearch,
        lastSubmittedSearch: trimmedSearch,
      },
      () => {
        void this.loadProducts(trimmedSearch);
      }
    );
  };

  handleErrorTest = () => {
    this.setState({ triggerError: true });
  };

  renderResultsSection() {
    const { isLoading, errorMessage, items } = this.state;

    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (errorMessage) {
      return <ErrorMessage message={errorMessage} />;
    }

    return <CardList items={items} />;
  }

  render() {
    const { inputValue, triggerError } = this.state;

    if (triggerError) {
      throw new Error('Simulated application failure');
    }

    return (
      <div className="mx-auto min-h-screen w-full max-w-5xl p-4 sm:p-6">
        <Header title="Product Search" />
        <Main>
          <section
            className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            aria-label="Search section"
          >
            <Search
              value={inputValue}
              onValueChange={this.handleInputChange}
              onSearch={this.handleSearch}
            />
          </section>
          <section
            className="min-h-[420px] rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            aria-label="Results section"
          >
            {this.renderResultsSection()}
          </section>
        </Main>
        <footer className="mt-3 flex justify-end">
          <button
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-base font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-500/50"
            type="button"
            onClick={this.handleErrorTest}
          >
            Trigger Error
          </button>
        </footer>
      </div>
    );
  }
}

export default App;
