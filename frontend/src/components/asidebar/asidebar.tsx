import useWorkspaceId from "@/hooks/use-workspace-id";
import Logo from "../logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { useState } from "react";
import { useAuthContext } from "@/context/auth-provider";
import { Link } from "react-router";

const Asidebar = () => {
  const { isLoading, user } = useAuthContext();

  const workspaceId = useWorkspaceId();
  const { open } = useSidebar();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="py-0! dark:bg-background">
          <div className="flex h-[50px] items-center justify-start w-full px-1">
            <Logo url={`/workspace/${workspaceId}`} />
            {open && (
              <Link
                to={`/workspace/${workspaceId}`}
                className="hidden md:flex ml-2 items-center gap-2 self-center font-medium"
              >
                Taskify
              </Link>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="">
          <SidebarGroup>
            <SidebarGroupContent>
              <div>Hello</div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem></SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default Asidebar;
