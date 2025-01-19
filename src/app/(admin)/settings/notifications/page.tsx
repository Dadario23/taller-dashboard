import ContentSection from "@/components/settings/content-section";
import { NotificationsForm } from "@/components/settings/notifications/notifications-form";

export default function SettingsNotifications() {
  return (
    <ContentSection
      title="Notifications"
      desc="Configure how you receive notifications."
    >
      <NotificationsForm />
    </ContentSection>
  );
}
