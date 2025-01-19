import ContentSection from "@/components/settings/content-section";
import { AppearanceForm } from "@/components/settings/appearance/appearance-form";

export default function SettingsAppearance() {
  return (
    <ContentSection
      title="Appearance"
      desc="Customize the appearance of the app. Automatically switch between day
          and night themes."
    >
      <AppearanceForm />
    </ContentSection>
  );
}
