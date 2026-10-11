import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "#/components/ui/sidebar";
import { Globe, Heart, KeyRound, LogOut, Users } from "lucide-react";
import type { Tab } from "../shared/admin-types";

export default function AppSidebar({
	tab,
	onTabChange,
	rsvpCount,
	onLogout,
}: {
	tab: Tab;
	onTabChange: (tab: Tab) => void;
	rsvpCount: number;
	onLogout: () => void;
}) {
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="data-[active=true]:bg-transparent"
						>
							<div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
								<Heart className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-serif text-base">
									RSVP Admin
								</span>
								<span className="truncate text-xs text-sidebar-foreground/70">
									Elvin &amp; Eric
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Manage</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={tab === "responses"}
								onClick={() => onTabChange("responses")}
								tooltip="Responses"
							>
								<Users />
								<span>Responses</span>
								{rsvpCount > 0 && (
									<SidebarMenuBadge>{rsvpCount}</SidebarMenuBadge>
								)}
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={tab === "details"}
								onClick={() => onTabChange("details")}
								tooltip="Details"
							>
								<Globe />
								<span>Details</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={tab === "security"}
								onClick={() => onTabChange("security")}
								tooltip="Security"
							>
								<KeyRound />
								<span>Security</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={onLogout} tooltip="Log out">
							<LogOut />
							<span>Log out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}