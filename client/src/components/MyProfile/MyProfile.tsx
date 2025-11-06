import style from "./MyProfile.module.css";
import { useAuth } from "../Authentication/useAuth";
import { PiUploadSimple } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useLogOut from "../Authentication/LogOut/useLogOut";
import LogOutBtn from "../Authentication/LogOut/LogOutBtn";
import { useMediaQuery } from "react-responsive";
import { apiClient } from "../../utils/apiClient";
import { supabase } from "../../utils/supabaseClient";

export default function MyProfile() {
  const { user } = useAuth();
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const logOutHandler = useLogOut();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      let profilePictureUrl = user?.profilePicture; // Keep existing if no new file

      // Upload new profile picture if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("Profile Pictures")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Create signed URL for private bucket (10 year expiry)
        const { data: signedUrlData, error: signedError } =
          await supabase.storage
            .from("Profile Pictures")
            .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 years

        if (signedError) {
          throw new Error(`Signed URL creation failed: ${signedError.message}`);
        }

        profilePictureUrl = signedUrlData.signedUrl;

        // Delete old profile picture to save storage
        if (
          user?.profilePicture &&
          !user.profilePicture.includes("default_avatar.jpg")
        ) {
          try {
            // Extract filename from old URL
            const urlParts = user.profilePicture.split("/");
            const oldFileName = urlParts[urlParts.length - 1].split("?")[0]; // Remove query params
            await supabase.storage
              .from("Profile Pictures")
              .remove([oldFileName]);
          } catch (deleteErr) {
            console.warn("Could not delete old profile picture:", deleteErr);
            // No throw - proceed with update even if deletion fails
          }
        }
      }

      // Update user profile with the signed URL
      await apiClient("/user/update", {
        method: "PUT",
        body: JSON.stringify({
          bio,
          profilePicture: profilePictureUrl,
        }),
      });

      navigate(0);
    } catch (err) {
      console.error("Error updating profile:", err);
      navigate("/error");
    }
  };

  const handleDeleteAccount = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const deleteAcc = confirm("Are you sure you want to delete your Account?");

    if (!deleteAcc) {
      return;
    }

    try {
      const data = await apiClient("/user/delete", { method: "DELETE" });

      if (data.message === "User deleted successfully.") {
        logOutHandler(e);
      }
    } catch (err) {
      console.error("Error deleting user: ", err);
      navigate("/error");
    }
  };

  return (
    <div className={style.editProfileWrapper}>
      {isMobile && (
        <div className={style.logOutBlock}>
          <LogOutBtn className={style.logoutLink} />
        </div>
      )}
      <h2 className={style.greeting}>
        Hi {user?.firstName} {user?.lastName}!
      </h2>

      {/* Profile Picture */}
      <div className={style.containerProfileImg}>
        <div className={style.profileImgWrapper}>
          <img src={previewUrl || user?.profilePicture} alt="Profile-Preview" />
          <div className={style.iconUploadImg}>
            <input
              type="file"
              accept="image/*"
              id="profileUpload"
              onChange={handleFileChange}
            />
            <label htmlFor="profileUpload">
              <PiUploadSimple size={"1.5em"} color="white" />
            </label>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className={style.bioSection}>
        <label htmlFor="bio">Bio</label>
        <textarea
          name="bio"
          id="bio"
          defaultValue={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* Action buttons */}
      <div className={style.actionButtons}>
        <button
          className={style.btnPrimary}
          onClick={(e) => handleSaveProfile(e)}
        >
          Save Profile
        </button>
        <button
          className={style.btnDelete}
          onClick={(e) => handleDeleteAccount(e)}
        >
          Delete Account
        </button>
        <button className={style.btnSecondary} onClick={() => navigate("/")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
