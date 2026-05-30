import { asyncHandlers } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUploadResponse =
    await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarUploadResponse) {
    throw new ApiError(500, "Error while uploading avatar image");
  }

  const newUser = await User.create({
    fullName,
    avtar: avatarUploadResponse.url,
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

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});
