'use server';

export async function verifyAdminCredentials(username?: string, password?: string): Promise<boolean> {
  const envUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || process.env.ADMIN_USERNAME;
  const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  console.log("=== ADMIN VERIFICATION DEBUG ===");
  console.log("Input Username:", username);
  console.log("Env Username Loaded:", envUsername ? `YES (length: ${envUsername.length})` : "NO");
  console.log("Env Password Loaded:", envPassword ? `YES (length: ${envPassword.length})` : "NO");

  if (!envUsername || !envPassword) {
    console.error("ADMIN_USERNAME or ADMIN_PASSWORD is not set in environment variables.");
    return false;
  }

  const match = username?.trim() === envUsername.trim() && password === envPassword;
  console.log("Credentials Match:", match);
  console.log("================================");

  return match;
}
