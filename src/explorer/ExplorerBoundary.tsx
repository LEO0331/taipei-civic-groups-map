import { Component, type ReactNode } from 'react';

/** Optional navigation must never take the host catalogue down with it. */
export default class ExplorerBoundary extends Component<{ children: ReactNode; onBack: () => void; language: 'zh' | 'en' }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section className="notice" role="alert">
      <p>{this.props.language === 'zh' ? '主題圖暫時無法載入，仍可使用資料目錄。' : 'Explorer could not load. The catalogue is still available.'}</p>
      <button type="button" autoFocus onClick={this.props.onBack}>{this.props.language === 'zh' ? '返回資料目錄' : 'Return to catalogue'}</button>
    </section>;
    return this.props.children;
  }
}
