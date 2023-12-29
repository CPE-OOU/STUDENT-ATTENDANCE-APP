import { Sidebar } from '../__components/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout: React.FC<DashboardLayoutProps> = async ({
  children,
}) => {
  return (
    <div className="h-full">
      <div className="flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="translate-x-72 w-[calc(100vw-18rem)]  h-full">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
