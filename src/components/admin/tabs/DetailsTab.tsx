import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "#/server/site";
import { CheckCircle2, Loader2, MapPin, MessageCircle, Palette, PartyPopper, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DEFAULT_PRIMARY_HEX, DEFAULT_SECONDARY_HEX, toDateTimeLocal } from "../shared/admin-utils";
import ColorPicker from "../settings/ColorPicker";
import ImagePicker from "../settings/ImagePicker";

export default function DetailsTab() {
	const [form, setForm] = useState<SiteSettings | null>(null);
	const [status, setStatus] = useState<
		"idle" | "loading" | "saving" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		getSiteSettings()
			.then((res) => {
				if (cancelled) return;
				setForm(res);
				setStatus("idle");
			})
			.catch((err) => {
				if (cancelled) return;
				setStatus("error");
				setError(
					err instanceof Error ? err.message : "Failed to load settings.",
				);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	if (form === null) {
		return status === "error" ? (
			<p role="alert" className="mt-6 text-center text-destructive">
				{error}
			</p>
		) : (
			<div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
				<Loader2 className="animate-spin" />
				Loading details…
			</div>
		);
	}

	
type ScheduleItem = SiteSettings["schedule"][number];
type ScheduleField = keyof ScheduleItem;

function update<K extends keyof SiteSettings>(
  field: K,
  value: SiteSettings[K],
) {
  setForm((previous) =>
    previous ? { ...previous, [field]: value } : previous,
  );
}

function updateItem<K extends ScheduleField>(
  index: number,
  field: K,
  value: ScheduleItem[K],
) {
  setForm((previous) => {
    if (!previous) return previous;

    return {
      ...previous,
      schedule: previous.schedule.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    };
  });

  setStatus("idle");
  setError(null);
}

function addItem() {
  setForm((previous) => {
    if (!previous || previous.schedule.length >= 10) return previous;

    return {
      ...previous,
      schedule: [
        ...previous.schedule,
        {
          label: "",
          title: "",
          time: "",
          location: previous.location,
          description: "",
          icon: "food",
        },
      ],
    };
  });

  setStatus("idle");
  setError(null);
}

function removeItem(index: number) {
  setForm((previous) => {
    if (!previous || previous.schedule.length <= 1) return previous;

    return {
      ...previous,
      schedule: previous.schedule.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    };
  });

  setStatus("idle");
  setError(null);
}

function updateVenue(
  which: "church" | "reception",
  field: "name" | "address" | "mapsUrl",
  value: string,
) {
  setForm((previous) => {
    if (!previous) return previous;

    const venue = {
      ...previous[which],
      [field]: value,
      ...(field === "name" ? { mapQuery: value } : {}),
    };

    return { ...previous, [which]: venue };
  });

  setStatus("idle");
  setError(null);
}

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!form || status === "saving") return;

  const invalidEventIndex = form.schedule.findIndex((item) =>
    [item.label, item.title, item.time, item.location, item.description]
      .some((value) => !value.trim()),
  );

  if (invalidEventIndex !== -1) {
    setStatus("error");
    setError(
      `Complete all fields for programme event ${invalidEventIndex + 1}.`,
    );
    return;
  }

  const invalidVenue = (["church", "reception"] as const).find(
    (which) => !form[which].name.trim() || !form[which].address.trim(),
  );

  if (invalidVenue) {
    setStatus("error");
    setError(
      `Complete the name and address for the ${
        invalidVenue === "church" ? "church / ceremony" : "reception"
      } venue.`,
    );
    return;
  }

  setStatus("saving");
  setError(null);

  try {
    const result = await updateSiteSettings({ data: form });
    setForm(result.settings);
    setStatus("success");
    toast.success("Wedding details saved.");
  } catch (err) {
    setStatus("error");
    setError(
      err instanceof Error
        ? err.message
        : "Failed to save wedding details.",
    );
    toast.error("Could not save wedding details.");
  }
}

	return (
		<form onSubmit={handleSubmit}>
			<Card className="mt-6">
				<CardContent className="grid gap-6">
					<div>
						<h2 className="flex items-center gap-2 text-lg font-semibold">
							<Palette className="size-5 text-secondary" />
							Wedding Details
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Customize what your guests see on the invitation.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="details-partnerA">Partner A Name</Label>
							<Input
								id="details-partnerA"
								value={form.partnerA}
								onChange={(event) => update("partnerA", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-partnerB">Partner B Name</Label>
							<Input
								id="details-partnerB"
								value={form.partnerB}
								onChange={(event) => update("partnerB", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-dateLabel">Date Label</Label>
							<Input
								id="details-dateLabel"
								placeholder="e.g. November 02, 2025"
								value={form.dateLabel}
								onChange={(event) => update("dateLabel", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-countdown">
								Countdown Date &amp; Time
							</Label>
							<Input
								id="details-countdown"
								type="datetime-local"
								value={toDateTimeLocal(form.countdownTarget)}
								onChange={(event) => {
									const value = event.target.value;
								  
									if (!value) {
									  setError("Choose a countdown date and time.");
									  setStatus("idle");
									  return;
									}
								  
									const date = new Date(value);
								  
									if (Number.isNaN(date.getTime())) {
									  setError("Enter a valid countdown date and time.");
									  setStatus("error");
									  return;
									}
								  
									update("countdownTarget", date.toISOString());
									setStatus("idle");
									setError(null);
								  }}
							/>
							<p className="text-xs text-muted-foreground">
								Shown until the ceremony begins.
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-location">Location</Label>
							<Input
								id="details-location"
								value={form.location}
								onChange={(event) => update("location", event.target.value)}
							/>
						</div>
						<div className="grid gap-4 sm:col-span-2">
							<ImagePicker
								fieldLabel="Hero Image"
								value={form.heroImage}
								fallback="/main.png"
								hint="PNG, JPG, WebP or SVG up to 5 MB — the invitation photo shown at the top."
								onValue={(url) => update("heroImage", url)}
							/>
						</div>
						<div className="grid gap-4 sm:col-span-2">
							<ImagePicker
								fieldLabel="Favicon"
								value={form.favicon}
								fallback="/icon.png"
								hint="Small icon shown in the browser tab next to the title."
								cropAspect={1}
								onValue={(url) => update("favicon", url)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-tagline">Intro Tagline</Label>
							<Input
								id="details-tagline"
								value={form.introTagline}
								onChange={(event) => update("introTagline", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-subtitle">Intro Subtitle</Label>
							<Input
								id="details-subtitle"
								value={form.introSubtitle}
								onChange={(event) =>
									update("introSubtitle", event.target.value)
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-rsvpDeadline">RSVP Deadline</Label>
							<Input
								id="details-rsvpDeadline"
								value={form.rsvpDeadline}
								onChange={(event) => update("rsvpDeadline", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-siteTitle">Site Title</Label>
							<Input
								id="details-siteTitle"
								value={form.siteTitle}
								onChange={(event) => update("siteTitle", event.target.value)}
							/>
						</div>
						<div className="grid gap-2 sm:col-span-2">
							<Label htmlFor="details-siteDescription">Site Description</Label>
							<Textarea
								id="details-siteDescription"
								rows={2}
								value={form.siteDescription}
								onChange={(event) =>
									update("siteDescription", event.target.value)
								}
							/>
						</div>
					</div>

					<div className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
						<ColorPicker
							id="details-primaryColor"
							label="Primary Color"
							value={form.primaryColor}
							fallback={DEFAULT_PRIMARY_HEX}
							hint="Themes burgundy accent — pick to override"
							onChange={(hex) => update("primaryColor", hex)}
						/>
						<ColorPicker
							id="details-secondaryColor"
							label="Secondary Color"
							value={form.secondaryColor}
							fallback={DEFAULT_SECONDARY_HEX}
							hint="Themes navy accent — pick to override"
							onChange={(hex) => update("secondaryColor", hex)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="mt-6">
				<CardContent className="grid gap-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<PartyPopper className="size-5 text-secondary" />
								Programme / Schedule
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Ceremony and reception events shown on the invitation.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={addItem}
							disabled={form.schedule.length >= 10}
						>
							<Plus />
							Add Event
						</Button>
					</div>

					{form.schedule.map((item, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: rows are appended/removed only, inputs are fully controlled
							key={index}
							className="grid gap-4 rounded-xl border border-border bg-muted/50 p-4"
						>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-label`}>Label</Label>
									<Input
										id={`event-${index}-label`}
										placeholder="Reception"
										value={item.label}
										onChange={(event) =>
											updateItem(index, "label", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-title`}>Title</Label>
									<Input
										id={`event-${index}-title`}
										placeholder="Reception &amp; Celebration"
										value={item.title}
										onChange={(event) =>
											updateItem(index, "title", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-time`}>Time</Label>
									<Input
										id={`event-${index}-time`}
										placeholder="1:00 PM Onwards"
										value={item.time}
										onChange={(event) =>
											updateItem(index, "time", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-location`}>Location</Label>
									<Input
										id={`event-${index}-location`}
										value={item.location}
										onChange={(event) =>
											updateItem(index, "location", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-icon`}>Icon</Label>
									<Select
										value={item.icon}
										onValueChange={(value) =>
											updateItem(
												index,
												"icon",
												value as SiteSettings["schedule"][number]["icon"],
											)
										}
									>
										<SelectTrigger
											id={`event-${index}-icon`}
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="church">Church</SelectItem>
											<SelectItem value="food">Food / Party</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid items-end gap-2 sm:col-span-2">
									<Label htmlFor={`event-${index}-description`}>
										Description
									</Label>
									<Textarea
										id={`event-${index}-description`}
										rows={2}
										value={item.description}
										onChange={(event) =>
											updateItem(index, "description", event.target.value)
										}
									/>
								</div>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="justify-self-start text-destructive"
								onClick={() => removeItem(index)}
								disabled={form.schedule.length <= 1}
							>
								<Trash2 />
								Remove Event
							</Button>
						</div>
					))}
				</CardContent>
			</Card>

			<Card className="mt-6">
				<CardContent className="grid gap-6">
					<div>
						<h2 className="flex items-center gap-2 text-lg font-semibold">
							<MapPin className="size-5 text-secondary" />
							Venue &amp; Location
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							The ceremony and reception venues shown on the Find Us map.
						</p>
					</div>

					{(
						[
							{ key: "church", label: "Church / Ceremony" },
							{ key: "reception", label: "Reception" },
						] as const
					).map(({ key, label }) => (
						<div
							key={key}
							className="grid gap-4 rounded-xl border border-border bg-muted/50 p-4"
						>
							<p className="text-sm font-semibold">{label}</p>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor={`details-${key}-name`}>Venue Name</Label>
									<Input
										id={`details-${key}-name`}
										placeholder="e.g. Nyanchwa SDA Church"
										value={form[key].name}
										onChange={(event) =>
											updateVenue(key, "name", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`details-${key}-address`}>Address</Label>
									<Input
										id={`details-${key}-address`}
										placeholder="e.g. Nyanchwa Adventist Complex, Kisii"
										value={form[key].address}
										onChange={(event) =>
											updateVenue(key, "address", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2 sm:col-span-2">
									<Label htmlFor={`details-${key}-mapsUrl`}>
										Google Maps Link
									</Label>
									<Input
										id={`details-${key}-mapsUrl`}
										placeholder="https://www.google.com/maps/search/?api=1&query=..."
										value={form[key].mapsUrl}
										onChange={(event) =>
											updateVenue(key, "mapsUrl", event.target.value)
										}
									/>
									<p className="text-xs text-muted-foreground">
										Optional. If blank, a directions link is generated from
										the venue name.
									</p>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card className="mt-6">
				<CardContent className="grid gap-6">
					<div>
						<h2 className="flex items-center gap-2 text-lg font-semibold">
							<MessageCircle className="size-5 text-secondary" />
							WhatsApp, Contact &amp; Gifts
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							The WhatsApp button and contact and gift numbers shown on the
							invitation.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="details-whatsappNumber">WhatsApp Number</Label>
							<Input
								id="details-whatsappNumber"
								placeholder="+254 712 345 678"
								value={form.whatsappNumber}
								onChange={(event) =>
									update("whatsappNumber", event.target.value)
								}
							/>
							<p className="text-xs text-muted-foreground">
								Shown on the Find Us section and used as a chat fallback.
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-whatsappGroupLink">
								WhatsApp Group Link
							</Label>
							<Input
								id="details-whatsappGroupLink"
								placeholder="https://chat.whatsapp.com/..."
								value={form.whatsappGroupLink}
								onChange={(event) =>
									update("whatsappGroupLink", event.target.value)
								}
							/>
							<p className="text-xs text-muted-foreground">
								Link opened by the floating WhatsApp button.
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-giftNumber">Gift / M-PESA Number</Label>
							<Input
								id="details-giftNumber"
								placeholder="0728 258 654"
								value={form.giftNumber}
								onChange={(event) =>
									update("giftNumber", event.target.value)
								}
							/>
							<p className="text-xs text-muted-foreground">
								M-PESA number shown on the Gift Contribution card.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{error && (
				<p role="alert" className="mt-4 text-sm text-destructive">
					{error}
				</p>
			)}

			<div className="mt-6 flex items-center gap-4">
				<Button type="submit" size="lg" disabled={status === "saving"}>
					{status === "saving" ? (
						<>
							<Loader2 className="animate-spin" />
							Saving…
						</>
					) : (
						"Save Details"
					)}
				</Button>
				{status === "success" && (
					<span className="flex items-center gap-2 text-sm text-primary">
						<CheckCircle2 className="size-4" />
						Saved.
					</span>
				)}
			</div>
		</form>
	);
}