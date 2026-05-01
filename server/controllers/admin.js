
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import fs from "fs";
import { promisify } from "util";
import { User } from "../models/User.js";

const unlinkAsync = promisify(fs.unlink);

//
// ======================= CREATE COURSE =======================
//
export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price } =
    req.body;

  // 🔥 FIX: check file exists
  if (!req.file) {
    return res.status(400).json({
      message: "Image file is required",
    });
  }

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: req.file.path, // safe now
    duration,
    price,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  });
});

//
// ======================= ADD LECTURE =======================
//
export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      message: "No Course with this id",
    });
  }

  const { title, description } = req.body;

  // 🔥 FIX: check file exists
  if (!req.file) {
    return res.status(400).json({
      message: "Video file is required",
    });
  }

  const lecture = await Lecture.create({
    title,
    description,
    video: req.file.path, // safe now
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

//
// ======================= DELETE LECTURE =======================
//
export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return res.status(404).json({
      message: "Lecture not found",
    });
  }

  // 🔥 FIX: safe file delete
  if (lecture.video && fs.existsSync(lecture.video)) {
    rm(lecture.video, () => {
      console.log("Video deleted");
    });
  }

  await lecture.deleteOne();

  res.json({
    message: "Lecture Deleted",
  });
});

//
// ======================= DELETE COURSE =======================
//
export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  const lectures = await Lecture.find({ course: course._id });

  // 🔥 delete all lecture videos safely
  await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.video && fs.existsSync(lecture.video)) {
        await unlinkAsync(lecture.video);
        console.log("video deleted");
      }
    })
  );

  // 🔥 delete course image safely
  if (course.image && fs.existsSync(course.image)) {
    rm(course.image, () => {
      console.log("image deleted");
    });
  }

  // delete lectures
  await Lecture.deleteMany({ course: req.params.id });

  // delete course
  await course.deleteOne();

  // remove subscription from all users
  await User.updateMany(
    {},
    { $pull: { subscription: req.params.id } }
  );

  res.json({
    message: "Course Deleted",
  });
});

//
// ======================= STATS =======================
//
export const getAllStats = TryCatch(async (req, res) => {
  const totalCourses = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  res.json({
    stats: {
      totalCourses,
      totalLectures,
      totalUsers,
    },
  });
});

//
// ======================= GET USERS =======================
//
export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user._id },
  }).select("-password");

  res.json({ users });
});

//
// ======================= UPDATE ROLE =======================
//
export const updateRole = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "superadmin") {
    return res.status(403).json({
      message: "This endpoint is assigned to superadmin",
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated to user",
    });
  }

  res.json({ message: "No change made" });
});