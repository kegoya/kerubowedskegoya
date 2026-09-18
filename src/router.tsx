import {
	createRouter as createTanStackRouter,
	Link,
} from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

function DefaultNotFound() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-6 text-center font-sans text-stone-900">
			<p className="text-xs font-semibold tracking-[0.35em] text-secondary uppercase">
				404
			</p>
			<h1 className="font-serif text-5xl tracking-tight">
				This page has eloped
			</h1>
			<p className="text-stone-500">
				The page you're looking for doesn't exist.
			</p>
			<Link
				to="/"
				className="inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Back to the invitation
			</Link>
		</main>
	);
}

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: DefaultNotFound,
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
