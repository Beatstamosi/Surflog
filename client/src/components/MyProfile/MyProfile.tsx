import style from "./MyProfile.module.css";
import { useAuth } from "../Authentication/useAuth";
import { PiUploadSimple } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useLogOut from "../Authentication/LogOut/useLogOut";
import LogOutBtn from "../Authentication/LogOut/LogOutBtn";
import { useMediaQuery } from "react-responsive";
import { apiClient } from "../../utils/apiClient";
import deleteProfilePictureFromStorage from "../../utils/deleteProfilePicture";
import uploadImageToSupaBase from "../../utils/uploadImageToSupaBase";

export default function MyProfile() {
  const { user } = useAuth();
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const logOutHandler = useLogOut();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in Bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < MAX_FILE_SIZE) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("File size must be less than 5MB");
      setSelectedFile(null);
      setPreviewUrl(user?.profilePicture || null);
      return;
    }
  };

  const handleSaveProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      let profilePictureUrl = user?.profilePicture; // Keep existing if no new file

      // Upload new profile picture if selected
      if (selectedFile && selectedFile.size < MAX_FILE_SIZE) {
        profilePictureUrl = await uploadImageToSupaBase(
          selectedFile,
          user?.id,
          "Profile Pictures"
        );

        // Delete old profile picture to save storage
        if (user?.profilePicture) {
          await deleteProfilePictureFromStorage(user.profilePicture);
        }
      } else if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
        alert("File size must be less than 5MB");
        return;
      }

      // Update user profile with the signed URL
      await apiClient("/user/update", {
        method: "PUT",
        body: JSON.stringify({
          bio,
          profilePicture: profilePictureUrl,
        }),
      });

      navigate(`/user/${user?.id}`);
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
        if (user?.profilePicture) {
          await deleteProfilePictureFromStorage(user.profilePicture);
        }

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
        <span className={style.maxFileSize}>Max. file size: 5MB</span>
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
        <button
          className={style.btnSecondary}
          onClick={() => navigate(`/user/${user?.id}`)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
