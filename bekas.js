const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    // Generate a token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      "yourSecretKey",
      { expiresIn: "1h" }
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during registration" });
  }
};

// Login an existing user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists
  const existingUser = await User.findOne({ username });
  if (!existingUser)
    return res.status(400).json({ error: "User does not exist" });

  // Check password
  const validPassword = await bcrypt.compare(password, existingUser.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid password" });

  try {
    // Generate a token
    const token = jwt.sign(
      { id: existingUser._id, role: existingUser.role },
      "yourSecretKey",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during login" });
  }
};

// Logout (this would actually be handled client-side to remove the JWT)
exports.logout = (req, res) => {
  // Invalidate the token (this part is usually done client-side)
  res.status(200).json({ message: "Logged out successfully" });
};
