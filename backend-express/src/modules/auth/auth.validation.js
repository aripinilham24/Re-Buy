export const validateRegister = ({ username, email, password }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!username || !email || !password) {
    throw { status: 400, message: "Semua field wajib diisi." };
  }

  if (!emailRegex.test(email)) {
    throw { status: 400, message: "Format email tidak valid." };
  }
};
