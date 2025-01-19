import ContentSection from "@/components/settings/content-section";
import { DisplayForm } from "@/components/settings/display/display-form";

export default function SettingsDisplay() {
  return (
    <ContentSection
      title="Display"
      desc="Turn items on or off to control what's displayed in the app."
    >
      <DisplayForm />
    </ContentSection>
  );
}
