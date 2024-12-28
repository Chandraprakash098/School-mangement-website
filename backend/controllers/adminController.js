// backend/controllers/adminController.js
const bcrypt = require('bcrypt');
const Library = require('../models/Library');
const  Syllabus = require('../models/Syllabus');
const StudyMaterial = require('../models/StudyMaterial')
const User = require('../models/User');
const LecturePeriod= require('../models/LecturePeriod')

// Add Book to Library
exports.addBook = async (req, res) => {
  try {
    const { 
      title, 
      author, 
      isbn, 
      category, 
      totalCopies 
    } = req.body;

    // Check if book with same ISBN already exists
    const existingBook = await Library.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = new Library({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};



const multer = require('multer');
const path = require('path');



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads/syllabus' folder exists
    const uploadPath = path.join(process.cwd(), 'uploads', 'syllabus');
    
    // Ensure the directory exists, create it if not
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Set the destination folder for the uploaded file
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp and original name
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const uploadSyllabus = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('syllabusFile');

exports.addSyllabus = async (req, res) => {
    uploadSyllabus(req, res, async (err) => {
      console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        console.log('Request File:', req.file);
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ msg: 'File upload error: ' + err.message,code: 'UPLOAD_ERROR',
                  details: err });
            }
            return res.status(400).json({ msg: err.message,code: 'GENERAL_ERROR',
              details: err });
        }

        try {
            const { subject, class: classLevel } = req.body;
            
            if (!subject || !classLevel) {
                return res.status(400).json({ msg: 'Subject and class are required',code: 'VALIDATION_ERROR',fields: {
                  subject: !subject ? 'missing' : 'ok',
                  class: !classLevel ? 'missing' : 'ok'
              } });
            }

            if (!req.file) {
                return res.status(400).json({ msg: 'Please upload a PDF file',code: 'FILE_MISSING' });
            }

            const syllabus = new Syllabus({
                subject,
                class: classLevel,
                pdfFile: {
                    filename: req.file.filename,
                    path: req.file.path,
                    originalname: req.file.originalname
                },
                uploadedBy: req.user.id
            });
            console.log('Saving syllabus:', syllabus);
            const savedSyllabus = await syllabus.save();
            console.log('Saved successfully:', savedSyllabus);

            await syllabus.save();

            res.status(201).json({
              msg: 'Syllabus uploaded successfully',
              data: savedSyllabus
          });
        } catch (err) {
            console.error(err);
            res.status(500).json({
              msg: 'Server Error',
              code: 'SERVER_ERROR',
              details: err.message
          });
        }
    });
};


// Add Study Material
exports.addStudyMaterial = async (req, res) => {
  try {
    const { 
      title, 
      subject, 
      class: classLevel, 
      type, 
      fileUrl, 
      description 
    } = req.body;

    const studyMaterial = new StudyMaterial({
      title,
      subject,
      class: classLevel,
      type,
      fileUrl,
      description,
      uploadedBy: req.user.id
    });

    await studyMaterial.save();
    res.status(201).json(studyMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// controllers/adminController.js
exports.createUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      class: userClass,
      fatherName,
      motherName,
      address
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      class: userClass,
      fatherName,
      motherName,
      address
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Remove sensitive information from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove password from update if present
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};




exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password')
      .sort({ name: 1 });
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};



exports.assignLecturePeriod = async (req, res) => {
  try {
    const {
      teacherId,
      subject,
      class: className,
      dayOfWeek,
      startTime,
      endTime,
      room
    } = req.body;

    console.log("Request Body:", req.body);

    // Validate teacher exists
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      console.log("Teacher not found");
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log("Teacher Found:", teacher);

    // Check for time conflicts
    const conflict = await LecturePeriod.checkConflict(teacherId, dayOfWeek, startTime, endTime);
    if (conflict) {
      console.log("Conflict Detected:", conflict);
      return res.status(400).json({ 
        message: 'Time slot conflicts with an existing period',
        conflictingPeriod: conflict
      });
    }

    const lecturePeriod = new LecturePeriod({
      teacher: teacherId,
      subject,
      class: className,
      dayOfWeek,
      startTime,
      endTime,
      room,
      createdBy: req.user.id
    });

    console.log("Lecture Period to Save:", lecturePeriod);

    await lecturePeriod.save();
    res.status(201).json(lecturePeriod);
  } catch (err) {
    console.error("Error in assignLecturePeriod:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Get teacher's lecture periods
exports.getTeacherLecturePeriods = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const periods = await LecturePeriod.find({ teacher: teacherId })
      .populate('teacher', 'name email')
      .sort({ dayOfWeek: 1, startTime: 1 });
      
    res.json(periods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update lecture period
exports.updateLecturePeriod = async (req, res) => {
  try {
    const { periodId } = req.params;
    const updateData = req.body;
    
    if (updateData.startTime || updateData.endTime || updateData.dayOfWeek) {
      const period = await LecturePeriod.findById(periodId);
      const conflict = await LecturePeriod.checkConflict(
        period.teacher,
        updateData.dayOfWeek || period.dayOfWeek,
        updateData.startTime || period.startTime,
        updateData.endTime || period.endTime,
        periodId
      );
      
      if (conflict) {
        return res.status(400).json({ 
          message: 'Time slot conflicts with an existing period',
          conflictingPeriod: conflict
        });
      }
    }
    
    updateData.updatedAt = Date.now();
    
    const period = await LecturePeriod.findByIdAndUpdate(
      periodId,
      updateData,
      { new: true }
    ).populate('teacher', 'name email');
    
    if (!period) {
      return res.status(404).json({ message: 'Lecture period not found' });
    }
    
    res.json(period);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete lecture period
exports.deleteLecturePeriod = async (req, res) => {
  try {
    const { periodId } = req.params;
    
    const period = await LecturePeriod.findByIdAndDelete(periodId);
    
    if (!period) {
      return res.status(404).json({ message: 'Lecture period not found' });
    }
    
    res.json({ message: 'Lecture period deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};