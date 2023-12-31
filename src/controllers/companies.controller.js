const companyService = require("../services/companies.service");

const createCompanyController = async (req, res) => {
  // try {
  //   const response = await companyService.createCompanyService(req.body);
  //   res.status(response.statusCode).json(response);
  // } catch (error) {
  //   res.status(500).json({
  //     message: "Unable to create account",
  //     status: "failure",
  //   });
  // }
  const response = await companyService.createCompanyService(req.body);
  res.status(response.statusCode).json(response);
};

const createAdminController = async (req, res) => {
  try {
    const response = await companyService.createAdminAccountService(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Unable to create admin",
      status: "failure",
    });
  }
};

const AdminLoginController = async (req, res) => {
  try {
    const response = await companyService.AdminLoginService(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Unable to login",
      status: "failure",
    });
  }
};

const createStaffController = async (req, res) => {
  try {
    const response = await companyService.createStaffAccountService(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Unable to create staff",
      status: "failure",
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const response = await companyService.forgotPasswordService(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to work",
      status: "failure",
    });
  }
};

const getAllCompaniesController = async (req, res) => {
  try {
    const response = await companyService.getAllCompaniesService();
    res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to get companies",
      status: "failure",
    });
  }
};

const findStaffController = async (req, res) => {
  const response = await companyService.findStaffService(req.query);
  res.status(response.statusCode).json(response);
};

const resetPasswordController = async (req, res) => {
  try {
    const response = await companyService.resetPasswordService(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to reset password",
      status: "failure",
    });
  }
};

const getAllStaffController = async (req, res) => {
  try {
    const response = await companyService.getAllStaffService(
      req.user,
      req.body
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to get All Staff",
      status: "failure",
    });
  }
};

module.exports = {
  createCompanyController,
  createAdminController,
  createStaffController,
  AdminLoginController,
  getAllCompaniesController,
  forgotPasswordController,
  findStaffController,
  resetPasswordController,
  getAllStaffController,
};
