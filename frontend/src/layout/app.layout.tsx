import Asidebar from "@/components/asidebar/asidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthProvider from "@/context/auth-provider";

const AppLayout = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Asidebar />
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;
