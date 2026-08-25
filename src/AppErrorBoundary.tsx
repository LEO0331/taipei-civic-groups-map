import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard render failed', error, info);
  }

  render() {
    if (this.state.failed) return <main className="module-panel"><h1>Unable to load the dashboard</h1><p>請重新整理頁面；若問題持續，請稍後再試。 Please refresh the page and try again later.</p><button type="button" onClick={() => window.location.reload()}>Refresh / 重新整理</button></main>;
    return this.props.children;
  }
}
