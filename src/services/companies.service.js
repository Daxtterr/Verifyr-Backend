const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/company.model");
const Staff = require("../models/staff.model");
const responses = require("../utils/response");
const generateResetPin = require("../utils/generateResetPin");
const sendMail = require("../utils/sendResetPasswordMail");

const createCompanyService = async (payload) => {
  const { name, contactEmail, regNo } = payload;

  const foundUser = await Company.findOne({ name: name });
  if (foundUser) {
    return responses.buildFailureResponse(
      "Company name already registered",
      400
    );
  }

  const foundRegNo = await Company.findOne({ regNo: regNo });
  if (foundRegNo) {
    return responses.buildFailureResponse(
      "Company's registration number already exists",
      400
    );
  }

  const foundEmail = await Company.findOne({ contactEmail: contactEmail });
  if (foundEmail) {
    return responses.buildFailureResponse(
      "Company's email number already exists",
      400
    );
  }

  const newCompany = await Company.create(payload);
  return responses.buildSuccessResponse(
    "Company created Successfully",
    200,
    newCompany
  );
};

const createAdminAccountService = async (payload) => {
  const { contactNo, contactEmail } = payload;

  const foundcontactNo = await Staff.findOne({ contactNo: contactNo });
  if (foundcontactNo) {
    return {
      message: "Phone number already in use",
      status: "failure",
      statusCode: 400,
    };
  }

  const foundEmail = await Staff.findOne({ contactEmail: contactEmail });
  if (foundEmail) {
    return {
      message: "Staff email already in use",
      status: "failure",
      statusCode: 400,
    };
  }

  const saltRounds = 10; //typically stored in dotenv
  const generatedSalt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(payload.password, generatedSalt);
  payload.password = hashedPassword;
  payload.role = "admin";

  const newAdmin = await Staff.create(payload);
  return {
    message: "Account created successfully",
    statusCode: 201,
    status: "success",
    data: newAdmin,
  };

  // const foundEmailOrPhone = await Staff.findOne({
  //   $or: [{ email: payload.email }, { email: payload.phone }],
  // });

  // if (foundEmailOrPhone) {
  //   return {
  //     message: "Staff phone or email duplicated",
  //     statusCode: 400,
  //     status: "failure",
  //   };
  // }
};

const createStaffAccountService = async (payload) => {
  const { contactEmail, contactNo } = payload;

  const foundContactEmail = await Staff.findOne({ contactEmail: contactEmail });
  if (foundContactEmail) {
    return {
      message: "Email already exists",
      statusCode: 400,
      status: "failure",
    };
  }

  const foundContactNo = await Staff.findOne({ contactNo: contactNo });
  if (foundContactNo) {
    return responses.buildFailureResponse("Phone number already exists", 400);
  }

  const newStaff = await Staff.create(payload);
  return responses.buildSuccessResponse(
    "Account created successfully",
    201,
    newStaff
  );
};

const AdminLoginService = async (payload) => {
  const { contactEmail, password } = payload;

  const foundStaff = await Staff.findOne({ contactEmail: contactEmail }).lean();
  if (!foundStaff) {
    return responses.buildFailureResponse("User not found", 404);
  }

  if (foundStaff.role !== "admin") {
    return responses.buildFailureResponse("Only Admins Allowed", 403);
  }

  const passwordMatch = await bcrypt.compare(password, foundStaff.password);
  if (!passwordMatch) {
    return responses.buildFailureResponse("Password Incorrect", 400);
  }

  const token = jwt.sign(
    {
      email: foundStaff.contactEmail,
      firstName: foundStaff.firstName,
      role: foundStaff.companyRole,
      _id: foundStaff._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  foundStaff.accessToken = token;
  return responses.buildSuccessResponse("Login successful", 200, foundStaff);
};

const getAllCompaniesService = async () => {
  const allStaff = await Company.find({});
  if (!allStaff) {
    return responses.buildFailureResponse(
      "Cannot fetch staff at this time",
      404
    );
  }
  const numberOfCompanies = allStaff.length;
  return responses.buildSuccessResponse(
    `Available companies displayed are ${numberOfCompanies}`,
    200,
    allStaff
  );
};

const forgotPasswordService = async (payload) => {
  const { contactEmail } = payload;
  const foundEmail = await Staff.findOne({ contactEmail: contactEmail });
  if (!foundEmail) {
    return responses.buildFailureResponse("Email not found", 400);
  }
  const resetPin = generateResetPin();
  const updatedUser = await Staff.findByIdAndUpdate(
    { _id: foundEmail._id },
    { resetPin, resetPin },
    { new: true }
  );

  const forgotPasswordPayload = {
    to: updatedUser.contactEmail,
    subject: "RESET PASSWORD",
    pin: resetPin,
  };

  await sendMail.sendForgotPasswordMail(forgotPasswordPayload);
  return responses.buildSuccessResponse(
    "Forgot Password Successful",
    200,
    updatedUser
  );
};

const resetPasswordService = async (payload) => {
  const { contactEmail, resetPin } = payload;

  const foundUserAndPin = await Staff.findOne(
    { contactEmail: contactEmail },
    { resetPin: resetPin }
  );

  if (!foundUserAndPin) {
    return responses.buildFailureResponse("Reset Pin Invalid", 400);
  }

  //hashing new password
  const saltRounds = 10; //typically stored in dotenv
  const generatedSalt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(payload.password, generatedSalt);

  const updatedUser = await Staff.findByIdAndUpdate(
    { _id: foundUserAndPin._id },
    { password: hashedPassword, resetPin: null },
    { new: true }
  );

  return responses.buildSuccessResponse(
    "Password Reset Successful",
    200,
    updatedUser
  );
};

const verifyUserService = async (payload) => {
  const { firstName, lastName, companyName } = payload;
  const foundUser = await Staff.findOne({
    firstName: firstName,
    lastName: lastName,
  });
  if (!foundUser) {
    return responses.buildFailureResponse("User not found", 400);
  }
  const foundCompany = await Company.findOne({ name: companyName });
  if (!foundCompany) {
    return responses.buildFailureResponse("Company not found", 400);
  }
  if (!foundCompany._id.equals(foundUser.company)) {
    return responses.buildFailureResponse(
      `${foundUser.firstName + " " + foundUser.lastName} does not work at ${
        foundCompany.name
      }`,
      400
    );
  }
  return responses.buildSuccessResponse(
    `${foundUser.firstName + " " + foundUser.lastName} works at ${
      foundCompany.name
    }`,
    200
  );
};

module.exports = {
  createCompanyService,
  AdminLoginService,
  createAdminAccountService,
  createStaffAccountService,
  getAllCompaniesService,
  forgotPasswordService,
  verifyUserService,
  resetPasswordService,
};