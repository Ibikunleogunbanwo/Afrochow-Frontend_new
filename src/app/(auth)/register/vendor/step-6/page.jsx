import { redirect } from "next/navigation";

// Step 6 (Address) has been merged into step 3 (Branding & Location)
export default function Step6Redirect() {
  redirect("/register/vendor/step-3");
}
