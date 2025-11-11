import { supabase } from "./supabaseClient";

export default async function uploadImageToSupaBase(
  selectedFile: File,
  userId: number | undefined,
  bucketName: string,
  timeStamp?: string
): Promise<string | undefined> {
  if (!selectedFile) return undefined;

  // Validate file type (optional but recommended)
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(selectedFile.type)) {
    throw new Error(
      "Invalid file type. Please upload JPEG, PNG, or WebP images."
    );
  }

  // Validate file size (optional but recommended)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (selectedFile.size > maxSize) {
    throw new Error(
      "File size too large. Please upload images smaller than 5MB."
    );
  }

  // Create safe timestamp
  if (!timeStamp) {
    timeStamp = Date.now().toString(); // Simple timestamp without special characters
  } else {
    // Sanitize the timestamp to remove any special characters that might break file paths
    timeStamp = timeStamp.replace(/[^a-zA-Z0-9]/g, "-");
  }

  const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
  const fileName = `${userId}-${timeStamp}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Create signed URL for private bucket (10 year expiry for demo purposes)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 years

    if (signedError) {
      throw new Error(`Signed URL creation failed: ${signedError.message}`);
    }

    return signedUrlData.signedUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error; // Re-throw to let caller handle it
  }
}
