import { Card, CardContent } from "#/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { Loader2, PartyPopper, Users, UserX } from "lucide-react";
import { formatDate } from "../shared/admin-utils";
import type { RsvpRecord } from "../shared/admin-types";
import { Badge } from "#/components/ui/badge";

export default function ResponsesTab({
    status,
    error,
    rsvps,
    attending,
    totalGuests,
}: {
    status: "idle" | "loading" | "error";
    error: string | null;
    rsvps: RsvpRecord[];
    attending: RsvpRecord[];
    totalGuests: number;
}) {
    return (
        <>
            {status === "loading" && rsvps.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-32 text-muted-foreground">
                    <Loader2 className="animate-spin" />
                    Loading responses…
                </div>
            ) : error ? (
                <p role="alert" className="py-32 text-center text-destructive">
                    {error}
                </p>
            ) : (
                <>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardContent className="flex items-center gap-4">
                                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                                    <Users className="size-5" />
                                </span>
                                <div>
                                    <p className="font-serif text-3xl tabular-nums">
                                        {rsvps.length}
                                    </p>
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Total responses
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4">
                                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
                                    <PartyPopper className="size-5" />
                                </span>
                                <div>
                                    <p className="font-serif text-3xl tabular-nums">
                                        {attending.length}
                                    </p>
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Attending
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4">
                                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
                                    <Users className="size-5" />
                                </span>
                                <div>
                                    <p className="font-serif text-3xl tabular-nums">
                                        {totalGuests}
                                    </p>
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Guests expected
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {rsvps.length === 0 ? (
                        <div className="py-32 text-center text-muted-foreground">
                            No RSVP responses yet.
                        </div>
                    ) : (
                        <Card className="mt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Attending</TableHead>
                                        <TableHead className="text-center">Guests</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rsvps.map((entry, index) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="tabular-nums text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {entry.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {entry.phone}
                                            </TableCell>
                                            <TableCell>
                                                {entry.attending === "yes" ? (
                                                    <Badge variant="secondary">
                                                        <PartyPopper className="size-3" />
                                                        Attending
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <UserX className="size-3" />
                                                        Declined
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center tabular-nums">
                                                {entry.guests}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] text-muted-foreground italic">
                                                {entry.message ? (
                                                    <span title={entry.message}>
                                                        &ldquo;{entry.message}&rdquo;
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                {formatDate(entry.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </>
            )}
        </>
    );
}
