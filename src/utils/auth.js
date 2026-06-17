export const requireAuth = () => {
  // Şifre koruması geçici olarak kaldırıldı (kullanıcı talebi). 
  // Yeniden açmak için aşağıdaki kodların yorum satırlarını kaldırıp, üstteki return true; satırını silebilirsiniz.
  return true;
  
  /*
  const password = window.prompt("Lütfen yetkili şifresini giriniz:");
  // Basit şifre: marash
  if (password === "marash") {
    return true;
  } else if (password !== null) {
    alert("Hatalı şifre!");
  }
  return false;
  */
};
