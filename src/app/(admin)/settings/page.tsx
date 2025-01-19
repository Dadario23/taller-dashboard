import ContentSection from "@/components/settings/content-section";
import ProfileForm from "@/components/settings/profile/profile-form";

export default function SettingsProfile() {
  return (
    <ContentSection
      title="Profile"
      desc="This is how others will see you on the site."
    >
      <ProfileForm />
    </ContentSection>
  );
}
