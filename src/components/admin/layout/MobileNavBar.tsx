import { LogOut } from "lucide-react";
import { navItems, type Tab } from "../shared/admin-types";
import { cn } from "#/lib/utils";

export default function MobileNavBar({
	tab,
	onTabChange,
	onLogout,
}: {
	tab: Tab;
	onTabChange: (tab: Tab) => void;
	onLogout: () => void;
}) {
	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
			<ul className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-1.5">
				{navItems.map(({ id, label, icon: Icon }) => {
					const active = tab === id;
					return (
						<li key={id}>
							<button
								type="button"
								aria-current={active ? "page" : undefined}
								onClick={() => onTabChange(id)}
								className={cn(
									"flex min-w-16 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
									active
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<Icon className="size-5" />
								{label}
							</button>
						</li>
					);
				})}
				<li>
					<button
						type="button"
						aria-label="Log out"
						onClick={onLogout}
						className="flex min-w-16 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
					>
						<LogOut className="size-5" />
						Log out
					</button>
				</li>
			</ul>
		</nav>
	);
}