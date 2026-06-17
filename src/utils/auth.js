export const requireAuth = () => {
  const password = window.prompt("Lütfen yetkili şifresini giriniz:");
  // Basit şifre: marash
  if (password === "marash") {
    return true;
  } else if (password !== null) {
    alert("Hatalı şifre!");
  }
  return false;
};
