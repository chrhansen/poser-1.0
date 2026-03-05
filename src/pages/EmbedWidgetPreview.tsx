import { EmbedWidget } from "@/components/embed/EmbedWidget";

/**
 * Dev-only preview page for the EmbedWidget component.
 * Not linked in navigation — access directly at /dev/embed-widget.
 */
export default function EmbedWidgetPreview() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-6">
      <EmbedWidget partnerSlug="demo-ski-school" />
    </div>
  );
}
