import crypto from 'crypto';
import admin from '../config/firebase.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

export const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return next(new ErrorResponse('Please provide a Firebase ID token', 400));
    }

    // Verify token
    let decodedToken;
    try {
      console.log('Verifying Firebase ID token...');
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Token verified for user:', decodedToken.email);
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      // Log the full error object for debugging
      console.error(JSON.stringify(error, null, 2));
      return next(new ErrorResponse('Invalid token', 401));
    }

    const { email, name, picture, uid } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      try {
        // Create new user
        user = await User.create({
          name: name || 'User',
          email,
          password: crypto.randomBytes(16).toString('hex'), // Random password for social login
          isEmailVerified: true, // Google emails are verified
          profile: {
            social: {
              website: '',
              linkedin: '',
              github: '',
              twitter: ''
            }
          }
        });
      } catch (err) {
        if (err.code === 11000) {
          // Race condition: User was created by a parallel request
          console.log('Duplicate key error caught (race condition), fetching user...');
          user = await User.findOne({ email });
          if (!user) {
            return next(new ErrorResponse('Error fetching user after duplicate key error', 500));
          }
        } else {
          throw err;
        }
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    // Create token
    const token = user.getSignedJwtToken();

    // Generate email verification token
    const emailVerificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new ErrorResponse('Account is deactivated', 401));
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return next(
        new ErrorResponse('Please verify your email address', 401)
      );
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.name,
        fullName: user.name,
        email: user.email,
        role: user.role,
        bio: user.profile?.bio || '',
        title: user.profile?.title || '',
        linkedinUrl: user.profile?.social?.linkedin || '',
        skills: user.profile?.skills || [],
        resumeUrl: user.resumeUrl || '',
        avatarUrl: user.profile?.avatar || user.avatarUrl || '',
        profileComplete: user.profileComplete,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const formattedUser = {
      id: user._id,
      name: user.name,
      displayName: user.name,
      fullName: user.name,
      email: user.email,
      role: user.role,
      bio: user.profile?.bio || '',
      title: user.profile?.title || '',
      linkedinUrl: user.profile?.social?.linkedin || '',
      skills: user.profile?.skills || [],
      profileComplete: user.profileComplete,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: formattedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      'profile.bio': req.body.bio,
      'profile.social.linkedin': req.body.linkedinUrl,
      'profile.skills': req.body.skills,
      'profile.title': req.body.title,
      'profile.walletAddress': req.body.walletAddress
    };

    // Handle nested profile updates if passed as an object
    if (req.body.profile) {
      if (req.body.profile.bio) fieldsToUpdate['profile.bio'] = req.body.profile.bio;
      if (req.body.profile.title) fieldsToUpdate['profile.title'] = req.body.profile.title;
      if (req.body.profile.skills) fieldsToUpdate['profile.skills'] = req.body.profile.skills;
      if (req.body.profile.social) {
        if (req.body.profile.social.linkedin) fieldsToUpdate['profile.social.linkedin'] = req.body.profile.social.linkedin;
        if (req.body.profile.social.github) fieldsToUpdate['profile.social.github'] = req.body.profile.social.github;
        if (req.body.profile.social.website) fieldsToUpdate['profile.social.website'] = req.body.profile.social.website;
        if (req.body.profile.social.twitter) fieldsToUpdate['profile.social.twitter'] = req.body.profile.social.twitter;
      }
    }

    // Map frontend specific fields if they come flat
    if (req.body.fullName) {
      fieldsToUpdate.fullName = req.body.fullName;
      fieldsToUpdate.name = req.body.fullName; // Keep name synced with fullName for backward compatibility
    }
    if (req.body.displayName) fieldsToUpdate.displayName = req.body.displayName;
    if (req.body.title) fieldsToUpdate['profile.title'] = req.body.title;
    if (req.body.bio) fieldsToUpdate['profile.bio'] = req.body.bio;
    if (req.body.linkedinUrl) fieldsToUpdate['profile.social.linkedin'] = req.body.linkedinUrl;

    if (req.body.skills) {
      // Ensure skills is an array (Multer might make it a string if only one item)
      let skills = req.body.skills;
      if (typeof skills === 'string') {
        skills = [skills];
      }
      fieldsToUpdate['profile.skills'] = skills;
    }

    if (req.body.walletAddress) fieldsToUpdate['profile.walletAddress'] = req.body.walletAddress;

    // Handle file uploads
    if (req.files) {
      if (req.files.resume) {
        fieldsToUpdate.resumeUrl = `uploads/${req.files.resume[0].filename}`;
      }
      if (req.files.avatar) {
        fieldsToUpdate.avatarUrl = `uploads/${req.files.avatar[0].filename}`;
        fieldsToUpdate['profile.avatar'] = `uploads/${req.files.avatar[0].filename}`; // Keep sync if needed, though schema doesn't have it explicitly
      }
    }


    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    const formattedUser = {
      id: user._id,
      name: user.name,
      displayName: user.name,
      fullName: user.name,
      email: user.email,
      role: user.role,
      bio: user.profile?.bio || '',
      title: user.profile?.title || '',
      linkedinUrl: user.profile?.social?.linkedin || '',
      skills: user.profile?.skills || [],
      profileComplete: user.profileComplete,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: formattedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetpassword/${resetToken}`;

    // TODO: Send email
    console.log(resetUrl);

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:verificationtoken
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.verificationtoken)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      isEmailVerified: false
    });

    if (!user) {
      return next(new ErrorResponse('Invalid verification token', 400));
    }

    user.emailVerificationToken = undefined;
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
};
