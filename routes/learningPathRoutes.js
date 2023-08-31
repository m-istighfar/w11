const express = require("express");
const router = express.Router();
const LearningPathController = require("../controllers/LearningPathController");
const authorization = require("../middleware/authorizationMiddleware");

router.post(
  "/create",
  authorization(["admin"]),
  LearningPathController.createLearningPath
);
router.get(
  "/list",
  authorization(["admin", "author", "student"]),
  LearningPathController.listLearningPaths
);
router.post(
  "/addCourse",
  authorization(["admin", "author"]),
  LearningPathController.addCourseToPath
);
router.delete(
  "/delete/:id",
  authorization(["admin", "author"]),
  LearningPathController.deleteLearningPath
);
router.put(
  "/update/:id",
  authorization(["admin", "author"]),
  LearningPathController.updateLearningPath
);

router.delete(
  "/:pathId/deleteCourse/:courseId",
  LearningPathController.deleteCourseFromPath
);

module.exports = router;
