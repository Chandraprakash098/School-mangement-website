// backend/controllers/adminController.js
const bcrypt = require('bcrypt');
const Library = require('../models/Library');
const  Syllabus = require('../models/Syllabus');
const StudyMaterial = require('../models/StudyMaterial')
const User = require('../models/User');

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

// // Add Syllabus
// exports.addSyllabus = async (req, res) => {
//   try {
//     const { 
//       subject, 
//       class: classLevel, 
//       semester, 
//       topics, 
//       recommendedBooks,
//       additionalResources
//     } = req.body;

//     const syllabus = new Syllabus({
//       subject,
//       class: classLevel,
//       semester,
//       topics,
//       recommendedBooks,
//       additionalResources
//     });

//     await syllabus.save();
//     res.status(201).json(syllabus);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };


// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/syllabus');
//   },
//   filename: function(req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const uploadSyllabus = multer({ 
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed!'), false);
//     }
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// }).single('syllabusFile');

// // Add Syllabus with PDF
// exports.addSyllabus = async (req, res) => {
//   uploadSyllabus(req, res, async (err) => {
//     if (err) {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({ msg: 'File upload error: ' + err.message });
//       }
//       return res.status(400).json({ msg: err.message });
//     }

//     try {
//       if (!req.file) {
//         return res.status(400).json({ msg: 'Please upload a PDF file' });
//       }

//       const {
//         subject,
//         class: classLevel,
//         semester
//       } = req.body;

//       const syllabus = new Syllabus({
//         subject,
//         class: classLevel,
//         semester,
//         pdfFile: {
//           filename: req.file.filename,
//           path: req.file.path,
//           originalname: req.file.originalname
//         },
//         uploadedBy: req.user.id
//       });

//       await syllabus.save();
//       res.status(201).json(syllabus);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Server Error');
//     }
//   });
// };


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/syllabus');
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
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
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ msg: 'File upload error: ' + err.message });
            }
            return res.status(400).json({ msg: err.message });
        }

        try {
            const { subject, class: classLevel } = req.body;
            
            if (!subject || !classLevel) {
                return res.status(400).json({ msg: 'Subject and class are required' });
            }

            if (!req.file) {
                return res.status(400).json({ msg: 'Please upload a PDF file' });
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

            await syllabus.save();
            res.status(201).json(syllabus);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
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

// Create User (Admin can create users)
// exports.createUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create new user
//     user = new User({
//       name,
//       email,
//       password,
//       role
//     });

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     await user.save();

//     // Remove password from response
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(201).json(userResponse);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };


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