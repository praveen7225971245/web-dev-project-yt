import { asyncHandlers } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found for token generation");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens",
    );
  }
};

export const registerUser = asyncHandlers(async (req, res) => {
  // get user details from frontend
  // validate the user details - not empty, email format, password strength etc
  // check if user already exists in database - username or email should be unique
  // check for images and check for avatar image
  // upload the avatar image to cloudinary and get the url
  // create the user object - create entry in database
  // remove the password from the user object before sending response to frontend
  // check for user creation success
  //  send response to frontend

  const { fullName, email, username, password } = req.body;

  // validate the user details - not empty, email format, password strength etc

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists in database - username or email should be unique

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // check for avatar image and cover image in the request

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUploadResponse = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatarUploadResponse) {
    throw new ApiError(500, "Error while uploading avatar image");
  }

  // create the user object - create entry in database

  const newUser = await User.create({
    fullName,
    avatar: avatarUploadResponse.url,
    coverImage: coverImageUploadResponse?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  // send response to frontend

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandlers(async (req, res) => {
  // req body se data lena
  // username aur email ya dono check karna
  // db mai user find karna
  // password check karna
  // access and refresh token generate karna
  // cookie ke help se send karna

  const { username, email, password } = req.body;
  console.log("Login request body:", req.body); // Debugging log
  if (!username && !email) {
    throw new ApiError(400, "username or email is requried");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "password is not correct");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        refreshToken,
        accessToken,
      }, "User logged in successfully"),
    );
});

export const logoutUser = asyncHandlers(async (req, res) => {
  await User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      // new: true,
      returnDocument: "after",
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
