import { authOptions } from "@/lib/authOptions";
import ContentSection from "@/components/settings/content-section";
import ProfileForm from "@/components/settings/profile/profile-form";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { getServerSession } from "next-auth";
const SettingsProfile = async () => {
  await connectDB();

  // Obtener email del usuario autenticado desde sesión o middleware
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return <p>Please log in</p>;
  }

  const user = await User.findOne({ email: userEmail });

  if (!user) {
    return <p>User not found</p>;
  }
  return (
    <ContentSection
      title="Profile"
      desc="This is how others will see you on the site."
    >
      <ProfileForm
        user={{
          _id: user._id.toString(), // Incluimos _id convertido a string
          email: user.email,
          fullname: user.fullname || "",
          country: user.country || "",
          state: user.state || "",
          locality: user.locality || "",
          whatsapp: user.whatsapp || "",
          address: user.address || "",
          postalcode: user.postalcode || "",
        }}
      />
    </ContentSection>
  );
};

export default SettingsProfile;
