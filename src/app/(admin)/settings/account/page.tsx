import ContentSection from "@/components/settings/content-section";
import { AccountForm } from "@/components/settings/account/account-form";

export default function SettingsAccount() {
  return (
    <ContentSection
      title="Account"
      desc="Update your account settings. Set your preferred language and
          timezone."
    >
      <AccountForm />
    </ContentSection>
  );
}
