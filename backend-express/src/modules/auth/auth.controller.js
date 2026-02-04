import services from "./auth.services";

const register = async (req, res) => {
  try {
    const result = await services.register(req.body);
    res.status(200).json(result);
  } catch (e) {
    const status = e?.status || 500;
    res.status(status).json({ status: "error", message: e?.message || "terjadi kesalahan saat register" });
    console.log(e);
  }
};

const login = async (req, res) => {
  try {
    const result = await services.login(req.body);
    res.status(200).json(result);
  } catch (e) {
    const status = e?.status || 500;
    res.status(status).json({ status: "error", message: e?.message || "terjadi kesalahan saat login" });
    console.log(e);
  }
};

const authController = { register, login };

export default authController;