import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Slider } from "#/components/ui/slider";
import { Switch } from "#/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Textarea } from "#/components/ui/textarea";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "#/server/site";
import { CheckCircle2, Code2, Images, Loader2, MapPin, MessageCircle, Palette, PartyPopper, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DEFAULT_PRIMARY_HEX, DEFAULT_SECONDARY_HEX, toDateTimeLocal } from "../shared/admin-utils";
import ColorPicker from "../settings/ColorPicker";
import ImagePicker from "../settings/ImagePicker";

const DETAIL_TABS = [
	{ value: "wedding", label: "Wedding Details", icon: Palette },
	{ value: "programme", label: "Programme", icon: PartyPopper },
	{ value: "gallery", label: "Gallery", icon: Images },
	{ value: "venue", label: "Venue & Location", icon: MapPin },
	{ value: "contact", label: "Contact & Gifts", icon: MessageCircle },
	{ value: "developer", label: "Developer Card", icon: Code2 },
] as const;

type DetailTabValue = (typeof DETAIL_TABS)[number]["value"];

export default function DetailsTab() {
	const [tab, setTab] = useState<DetailTabValue>("wedding");
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

type GalleryItem = SiteSettings["gallery"]["items"][number];
type GalleryField = keyof GalleryItem;

function updateFeatured<K extends GalleryField>(
  field: K,
  value: GalleryItem[K],
) {
  setForm((previous) => {
    if (!previous) return previous;

    return {
      ...previous,
      gallery: {
        ...previous.gallery,
        featured: { ...previous.gallery.featured, [field]: value },
      },
    };
  });

  setStatus("idle");
  setError(null);
}

function updateGalleryItem<K extends GalleryField>(
  index: number,
  field: K,
  value: GalleryItem[K],
) {
  setForm((previous) => {
    if (!previous) return previous;

    return {
      ...previous,
      gallery: {
        ...previous.gallery,
        items: previous.gallery.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    };
  });

  setStatus("idle");
  setError(null);
}

function addGalleryItem() {
  setForm((previous) => {
    if (!previous || previous.gallery.items.length >= 12) return previous;

    return {
      ...previous,
      gallery: {
        ...previous.gallery,
        items: [...previous.gallery.items, { name: "", image: "", alt: "" }],
      },
    };
  });

  setStatus("idle");
  setError(null);
}

function removeGalleryItem(index: number) {
  setForm((previous) => {
    if (!previous) return previous;

    return {
      ...previous,
      gallery: {
        ...previous.gallery,
        items: previous.gallery.items.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
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

type DeveloperSettings = SiteSettings["developer"];
type DeveloperField = keyof DeveloperSettings;

function updateDeveloper<K extends DeveloperField>(
  field: K,
  value: DeveloperSettings[K],
) {
  setForm((previous) =>
    previous
      ? { ...previous, developer: { ...previous.developer, [field]: value } }
      : previous,
  );

  setStatus("idle");
  setError(null);
}

function updateService(index: number, value: string) {
  setForm((previous) => {
    if (!previous) return previous;

    return {
      ...previous,
      developer: {
        ...previous.developer,
        services: previous.developer.services.map((service, serviceIndex) =>
          serviceIndex === index ? value : service,
        ),
      },
    };
  });

  setStatus("idle");
  setError(null);
}

function addService() {
  setForm((previous) => {
    if (!previous || previous.developer.services.length >= 8) return previous;

    return {
      ...previous,
      developer: {
        ...previous.developer,
        services: [...previous.developer.services, ""],
      },
    };
  });

  setStatus("idle");
  setError(null);
}

function removeService(index: number) {
  setForm((previous) => {
    if (!previous) return previous;

    return {
      ...previous,
      developer: {
        ...previous.developer,
        services: previous.developer.services.filter(
          (_, serviceIndex) => serviceIndex !== index,
        ),
      },
    };
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

  const payload: SiteSettings = {
    ...form,
    developer: {
      ...form.developer,
      services: form.developer.services
        .map((service) => service.trim())
        .filter(Boolean),
    },
  };

  try {
    const result = await updateSiteSettings({ data: payload });
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
			<Tabs
				value={tab}
				onValueChange={(value) => setTab(value as DetailTabValue)}
			>
				<div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
					<TabsList className="w-full snap-x flex-nowrap justify-start gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-x-visible">
						{DETAIL_TABS.map(({ value, label, icon: Icon }) => (
							<TabsTrigger
								key={value}
								value={value}
								className="h-8 flex-none snap-start gap-2 px-3"
							>
								<Icon className="size-4" />
								{label}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				<TabsContent value="wedding">
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

							<div className="grid gap-3 rounded-xl border border-border bg-muted/50 p-4">
								<div className="flex items-center justify-between">
									<Label htmlFor="details-heroImageOpacity">
										Hero Image Opacity
									</Label>
									<span className="text-sm font-medium text-muted-foreground">
										{form.heroImageOpacity}%
									</span>
								</div>
								<Slider
									id="details-heroImageOpacity"
									min={0}
									max={100}
									step={5}
									value={[form.heroImageOpacity]}
									onValueChange={(value) =>
										update("heroImageOpacity", value[0] ?? 80)
									}
								/>
								<p className="text-xs text-muted-foreground">
									Lower values fade the hero photo into the background.
								</p>
							</div>
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
				</TabsContent>

				<TabsContent value="programme">
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
				</TabsContent>

				<TabsContent value="gallery">
					<Card className="mt-6">
						<CardContent className="grid gap-6">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="flex items-center gap-2 text-lg font-semibold">
										<Images className="size-5 text-secondary" />
										Gallery
									</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Photos, names and captions shown in the gallery section.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={addGalleryItem}
							disabled={form.gallery.items.length >= 12}
						>
							<Plus />
							Add Photo
						</Button>
					</div>

					<div className="grid gap-4 rounded-xl border border-border bg-muted/50 p-4">
						<p className="text-sm font-semibold">Featured Photo</p>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="gallery-featured-name">Photo Name</Label>
								<Input
									id="gallery-featured-name"
									placeholder="Bride &amp; Bridegroom"
									value={form.gallery.featured.name}
									onChange={(event) =>
										updateFeatured("name", event.target.value)
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="gallery-featured-alt">Alt Text</Label>
								<Input
									id="gallery-featured-alt"
									placeholder="Describe the photo for accessibility"
									value={form.gallery.featured.alt}
									onChange={(event) =>
										updateFeatured("alt", event.target.value)
									}
								/>
							</div>
							<div className="grid gap-4 sm:col-span-2">
								<ImagePicker
									fieldLabel="Featured Image"
									value={form.gallery.featured.image}
									fallback=""
									hint="PNG, JPG, WebP or SVG up to 5 MB — the large photo at the top of the gallery."
									onValue={(url) => updateFeatured("image", url)}
								/>
							</div>
						</div>
					</div>

					{form.gallery.items.length === 0 && (
						<p className="text-sm text-muted-foreground">
							No photos yet. Use “Add Photo” to build the gallery grid.
						</p>
					)}

					{form.gallery.items.map((item, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: rows are appended/removed only, inputs are fully controlled
							key={index}
							className="grid gap-4 rounded-xl border border-border bg-muted/50 p-4"
						>
							<p className="text-sm font-semibold">Photo {index + 1}</p>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor={`gallery-${index}-name`}>Photo Name</Label>
									<Input
										id={`gallery-${index}-name`}
										placeholder="Best Couple"
										value={item.name}
										onChange={(event) =>
											updateGalleryItem(index, "name", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`gallery-${index}-alt`}>Alt Text</Label>
									<Input
										id={`gallery-${index}-alt`}
										placeholder="Describe the photo for accessibility"
										value={item.alt}
										onChange={(event) =>
											updateGalleryItem(index, "alt", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-4 sm:col-span-2">
									<ImagePicker
										fieldLabel="Photo"
										value={item.image}
										fallback=""
										hint="PNG, JPG, WebP or SVG up to 5 MB."
										cropAspect={3 / 3.5}
										onValue={(url) =>
											updateGalleryItem(index, "image", url)
										}
									/>
								</div>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="justify-self-start text-destructive"
								onClick={() => removeGalleryItem(index)}
							>
								<Trash2 />
								Remove Photo
							</Button>
						</div>
					))}
				</CardContent>
			</Card>
				</TabsContent>

				<TabsContent value="venue">
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
				</TabsContent>

				<TabsContent value="contact">
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
								M-PESA number shown on the Gift Donation card.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
				</TabsContent>

				<TabsContent value="developer">
					<Card className="mt-6">
						<CardContent className="grid gap-6">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h2 className="flex items-center gap-2 text-lg font-semibold">
										<Code2 className="size-5 text-secondary" />
										Developer Card
									</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								The developer credit card shown near the bottom of the
								invitation.
							</p>
						</div>
						<label
							htmlFor="details-developer-enabled"
							className="flex items-center gap-2 text-sm font-medium"
						>
							<span className="text-muted-foreground">Show card</span>
							<Switch
								id="details-developer-enabled"
								checked={form.developer.enabled}
								onCheckedChange={(checked) =>
									updateDeveloper("enabled", checked)
								}
							/>
						</label>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="details-developer-name">Business Name</Label>
							<Input
								id="details-developer-name"
								value={form.developer.name}
								onChange={(event) =>
									updateDeveloper("name", event.target.value)
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-developer-tagline">Tagline</Label>
							<Input
								id="details-developer-tagline"
								value={form.developer.tagline}
								onChange={(event) =>
									updateDeveloper("tagline", event.target.value)
								}
							/>
						</div>
						<div className="grid gap-2 sm:col-span-2">
							<Label htmlFor="details-developer-description">
								Description
							</Label>
							<Textarea
								id="details-developer-description"
								rows={2}
								value={form.developer.description}
								onChange={(event) =>
									updateDeveloper("description", event.target.value)
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-developer-whatsappNumber">
								WhatsApp Number
							</Label>
							<Input
								id="details-developer-whatsappNumber"
								placeholder="+254 712 345 678"
								value={form.developer.whatsappNumber}
								onChange={(event) =>
									updateDeveloper("whatsappNumber", event.target.value)
								}
							/>
							<p className="text-xs text-muted-foreground">
								Used for the “Chat on WhatsApp” button.
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-developer-note">Footer Note</Label>
							<Input
								id="details-developer-note"
								value={form.developer.note}
								onChange={(event) =>
									updateDeveloper("note", event.target.value)
								}
							/>
						</div>
					</div>

					<div className="grid gap-4 rounded-xl border border-border bg-muted/50 p-4">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold">Services</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addService}
								disabled={form.developer.services.length >= 8}
							>
								<Plus />
								Add Service
							</Button>
						</div>

						{form.developer.services.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No services yet. Use “Add Service” to list what you offer.
							</p>
						)}

						{form.developer.services.map((service, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: rows are appended/removed only, inputs are fully controlled
								key={index}
								className="flex items-center gap-2"
							>
								<Input
									aria-label={`Service ${index + 1}`}
									placeholder="e.g. Wedding Websites"
									value={service}
									onChange={(event) =>
										updateService(index, event.target.value)
									}
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="shrink-0 text-destructive"
									aria-label={`Remove service ${index + 1}`}
									onClick={() => removeService(index)}
								>
									<Trash2 />
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
				</TabsContent>
			</Tabs>

			{error && (
				<p role="alert" className="mt-4 text-sm text-destructive">
					{error}
				</p>
			)}

			<div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-4 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/60 md:sticky md:inset-x-auto md:bottom-0 md:z-10 md:-mx-6 md:mt-6 md:px-6 md:shadow-none">
				<Button type="submit" size="lg" className="flex-1 md:flex-none" disabled={status === "saving"}>
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

			{/* Reserves space for the fixed mobile save bar so content isn't hidden */}
			<div aria-hidden="true" className="h-14 md:hidden" />
		</form>
	);
}