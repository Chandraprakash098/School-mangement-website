const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const adminController = require("../controllers/adminController");

// Library Routes
router.post(
  "/library/add-book",
  [auth, roleAuth(["admin"])],
  adminController.addBook
);

// Syllabus Routes
router.post(
  "/syllabus/add",
  [auth, roleAuth(["admin", "teacher"])],
  adminController.addSyllabus
);

// Study Material Routes
router.post(
  "/study-material/add",
  [auth, roleAuth(["admin", "teacher"])],
  adminController.addStudyMaterial
);

// User Management Routes
router.get("/users", [auth, roleAuth(["admin"])], adminController.getAllUsers);

router.post("/users", [auth, roleAuth(["admin"])], adminController.createUser);

router.put(
  "/users/:userId",
  [auth, roleAuth(["admin"])],
  adminController.updateUser
);

router.delete(
  "/users/:userId",
  [auth, roleAuth(["admin"])],
  adminController.deleteUser
);

router.get(
  "/teachers",
  [auth, roleAuth(["admin"])],
  adminController.getAllTeachers
);

router.post(
  "/lecture-periods",
  [auth, roleAuth(["admin"])],
  adminController.assignLecturePeriod
);

router.get(
  "/lecture-periods/teacher/:teacherId",
  [auth, roleAuth(["admin"])],
  adminController.getTeacherLecturePeriods
);

router.put(
  "/lecture-periods/:periodId",
  [auth, roleAuth(["admin"])],
  adminController.updateLecturePeriod
);

router.delete(
  "/lecture-periods/:periodId",
  [auth, roleAuth(["admin"])],
  adminController.deleteLecturePeriod
);

router.post(
  "/sports-event",
  [auth, roleAuth(["admin"])],
  adminController.createSportsEvent
);
router.put(
  "/sports-event/:eventId",
  [auth, roleAuth(["admin"])],
  adminController.updateSportsEvent
);
router.delete(
  "/sports-event/:eventId",
  [auth, roleAuth(["admin"])],
  adminController.deleteSportsEvent
);
router.get(
  "/sports-events",
  [auth, roleAuth(["admin"])],
  adminController.getAllSportsEvents
);

router.get(
  "/sports-events/:eventId/registrations",
  [auth, roleAuth(["admin"])],
  adminController.getEventRegistrations
);

module.exports = router;
