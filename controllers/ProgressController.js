const Progress = require("../models/progress"); // Import the Progress model

// Get progress for a specific course
exports.getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId,
    });
    if (!progress) {
      return res.status(404).send("Progress not found");
    }
    res.status(200).send(progress);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update or create progress for a specific course
exports.updateProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId,
    });

    // If no existing progress record, create one
    if (!progress) {
      progress = new Progress({
        studentId: req.user.id,
        courseId: req.params.courseId,
        completion: req.body.completion,
      });
    } else {
      // Update the completion percentage
      progress.completion = req.body.completion;
    }

    await progress.save();

    res.status(200).send(progress);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.markCourseAsCompleted = async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;

  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { courseId, studentId, status: "accepted" },
      { status: "completed" },
      { new: true }
    );

    if (!enrollment) {
      return res.status(403).json({
        error: "Not enrolled in this course or enrollment not approved",
      });
    }

    // Update the Progress record for this course to mark it as completed (100%)
    await Progress.findOneAndUpdate(
      { courseId, studentId },
      { completion: 100 },
      { new: true }
    );

    res.status(200).json(enrollment);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res.status(500).json({
      error: "An error occurred while marking the course as completed",
    });
  }
};
