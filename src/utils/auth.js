export const requireAuth = () => {
  const password = window.prompt("Lütfen yetkili şifresini giriniz:");
  // Basit şifre: marash
  if (password === "marash" || password === "maraş") {
    return true;
  } else if (password !== null) {
    alert("Hatalı şifre!");
  }
  return false;
};
