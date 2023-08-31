const User = require("../models/user");
const Course = require("../models/course");
const bcrypt = require("bcrypt");
const Enrollment = require("../models/enrollment");
const LearningPath = require("../models/learningpath");
const Progress = require("../models/progress");

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching users" });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if the username or email already exists
    const existingUserByUsername = await User.findOne({ username });
    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // If we're here, it means the username and email are unique
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the user" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    );
    res.status(200).json({ message: "update succes", updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the user" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch courses authored by the user
    const authoredCourses = await Course.find({ authorId: id });

    // Get IDs of the authored courses
    const courseIds = authoredCourses.map((course) => course._id);

    // Delete all courses created by this user
    await Course.deleteMany({ authorId: id });

    // Delete all enrollments related to this user
    await Enrollment.deleteMany({ studentId: id });

    // Delete all progress records related to this user
    await Progress.deleteMany({ studentId: id });

    // Remove courses authored by the user from all learning paths
    await LearningPath.updateMany(
      { courses: { $in: courseIds } },
      { $pullAll: { courses: courseIds } }
    );

    // Optionally, delete learning paths that have become empty
    // await LearningPath.deleteMany({ courses: { $size: 0 } });

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "User and related records deleted successfully" });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
  }
};

exports.assignRole = async (req, res) => {
  const { id, role } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while assigning the role" });
  }
};

exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  const id = req.user.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the profile" });
  }
};
