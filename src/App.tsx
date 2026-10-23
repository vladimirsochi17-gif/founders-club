import { FoundersApp } from './components/generated/FoundersApp';
import { AppErrorBoundary } from './components/AppErrorBoundary';

export default function App() {
  return <AppErrorBoundary><FoundersApp /></AppErrorBoundary>;
}
