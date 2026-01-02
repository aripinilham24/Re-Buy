import services from "./auth.services";

const register = async (req, res) => {
  try {
    const result = await services.register(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({
        status: 'error',
        message: 'terjadi kesalahan saat register'
    });
    console.log(e);
  }
};

export default authController;