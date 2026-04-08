import LoginForm from "./LoginForm";
import { getOAuthUiFlags } from "@/lib/costGuards";

export default function LoginPage() {
  const oauth = getOAuthUiFlags();
  return <LoginForm oauth={oauth} />;
}
