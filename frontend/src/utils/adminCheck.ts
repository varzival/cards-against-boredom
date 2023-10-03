import { useStore } from "@/store/app";

async function isAdminCheck() {
  const store = useStore();

  try {
    const response = await fetch("/api/auth/is_admin");
    if (response.status <= 299) {
      store.setIsAdmin(true);
      return true;
    } else {
      store.setIsAdmin(false);
      return false;
    }
  } catch (e) {
    return false;
  }
}

export default isAdminCheck;
