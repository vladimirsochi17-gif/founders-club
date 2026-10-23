import { Component, type ErrorInfo, type ReactNode } from "react";

export class AppErrorBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Interface rendering failed", error, info.componentStack); }
  render() {
    if (this.state.failed) return <main className="container page" role="alert">
      <h1>Не удалось отобразить страницу</h1>
      <p>Сохранённые на сервере данные не потеряны. Обновите страницу, чтобы повторить загрузку.</p>
      <button className="btn primary" onClick={() => location.reload()}>Обновить страницу</button>
    </main>;
    return this.props.children;
  }
}
