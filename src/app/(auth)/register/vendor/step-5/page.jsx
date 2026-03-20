import { redirect } from "next/navigation";

// Step 5 has been merged into step 4 (Operations)
export default function Step5Redirect() {
  redirect("/register/vendor/step-4");
}
