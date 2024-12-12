const Fees = require('../models/Account');
const User = require('../models/User');
const mongoose = require('mongoose');

// Generate unique receipt number
function generateReceiptNumber(feeId) {
  return `RCPT-${feeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// Create Fee Record
exports.createFeeRecord = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      studentId, 
      academicYear, 
      semester, 
      feeStructure, 
      discounts, 
      dueDate 
    } = req.body;

    // Verify student exists
    const student = await User.findById(studentId).session(session);
    if (!student || student.role !== 'student') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid student' });
    }

    // Check for existing fee record
    const existingFeeRecord = await Fees.findOne({
      student: studentId,
      academicYear,
      semester
    }).session(session);

    if (existingFeeRecord) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Fee record already exists for this student and semester' });
    }

    // Create new fee record
    const feeRecord = new Fees({
      student: studentId,
      academicYear,
      semester,
      feeStructure,
      discounts: discounts || [],
      dueDate,
    });

    await feeRecord.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    console.log(`Fee record created for student ${studentId}`);
    res.status(201).json(feeRecord);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Process Fee Payment
exports.processFeePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { feeId } = req.params;
    const { 
      amountPaid, 
      paymentMethod, 
      receiptNumber 
    } = req.body;

    const feeRecord = await Fees.findById(feeId).session(session);
    if (!feeRecord) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // Generate or use provided receipt number
    const finalReceiptNumber = receiptNumber || generateReceiptNumber(feeId);

    // Check if receipt number is already used in this fee record
    const isDuplicateReceipt = feeRecord.paymentDetails.some(
      payment => payment.receiptNumber === finalReceiptNumber
    );

    if (isDuplicateReceipt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Receipt number already exists' });
    }

    // Add payment details
    feeRecord.paymentDetails.push({
      amountPaid,
      paymentMethod,
      receiptNumber: finalReceiptNumber,
      paymentStatus: 'Completed'
    });

    await feeRecord.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    res.json(feeRecord);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Student Fee Records
exports.getStudentFeeRecords = async (req, res) => {
  try {
    const { studentId } = req.params;

    const feeRecords = await Fees.find({ student: studentId })
      .populate('student', 'name email');

    if (!feeRecords.length) {
      return res.status(404).json({ message: 'No fee records found' });
    }

    res.json(feeRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Generate Fee Report
exports.generateFeeReport = async (req, res) => {
  try {
    const { 
      academicYear, 
      semester, 
      paymentStatus 
    } = req.query;

    const query = {};
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const feeRecords = await Fees.find(query)
      .populate('student', 'name email');

    // Generate summary
    const report = {
      totalRecords: feeRecords.length,
      totalAmount: feeRecords.reduce((total, record) => total + record.totalFeeAmount, 0),
      records: feeRecords.map(record => ({
        studentName: record.student.name,
        studentEmail: record.student.email,
        academicYear: record.academicYear,
        semester: record.semester,
        totalFeeAmount: record.totalFeeAmount,
        remainingBalance: record.remainingBalance,
        paymentStatus: record.paymentStatus
      }))
    };

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update Fee Record
exports.updateFeeRecord = async (req, res) => {
  try {
    const { feeId } = req.params;
    const updateData = req.body;

    const updatedFeeRecord = await Fees.findByIdAndUpdate(
      feeId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedFeeRecord) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.json(updatedFeeRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete Fee Record
exports.deleteFeeRecord = async (req, res) => {
  try {
    const { feeId } = req.params;

    const deletedFeeRecord = await Fees.findByIdAndDelete(feeId);

    if (!deletedFeeRecord) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.json({ message: 'Fee record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Get Students by Class
exports.getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;

    // Find students in the specified class
    const students = await User.find({
      role: 'student',
      class: className
    }).select('name email class');

    if (!students.length) {
      return res.status(404).json({ 
        message: `No students found in class ${className}`,
        students: []
      });
    }

    res.json({
      message: `Students in class ${className}`,
      students: students
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create Fee Record for Specific Student
exports.createFeeRecordForStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      studentId, 
      academicYear, 
      semester, 
      feeStructure, 
      discounts, 
      dueDate 
    } = req.body;

    // Verify student exists
    const student = await User.findById(studentId).session(session);
    if (!student || student.role !== 'student') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid student' });
    }

    // Check for existing fee record for the specific period
    const existingFeeRecord = await Fees.findOne({
      student: studentId,
      academicYear,
      semester
    }).session(session);

    if (existingFeeRecord) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Fee record already exists for this student and semester' });
    }

    // Create new fee record
    const feeRecord = new Fees({
      student: studentId,
      academicYear,
      semester,
      feeStructure,
      discounts: discounts || [],
      dueDate,
    });

    await feeRecord.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    console.log(`Fee record created for student ${studentId}`);
    res.status(201).json(feeRecord);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Available Classes
exports.getAvailableClasses = async (req, res) => {
  try {
    // Retrieve unique classes with students
    const classes = await User.distinct('class', { role: 'student' });

    res.json({
      message: 'Available classes',
      classes: classes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Fee Details for Specific Student and Period
exports.getFeeDetailsForStudentPeriod = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    // Find fee record for the specific student, academic year, and semester
    const feeRecord = await Fees.findOne({
      student: studentId,
      academicYear,
      semester
    }).populate('student', 'name email');

    if (!feeRecord) {
      return res.status(404).json({ message: 'No fee record found for the specified period' });
    }

    res.json({
      studentName: feeRecord.student.name,
      studentEmail: feeRecord.student.email,
      academicYear: feeRecord.academicYear,
      semester: feeRecord.semester,
      feeStructure: feeRecord.feeStructure,
      totalFeeAmount: feeRecord.totalFeeAmount,
      remainingBalance: feeRecord.remainingBalance,
      paymentStatus: feeRecord.paymentStatus,
      dueDate: feeRecord.dueDate,
      discounts: feeRecord.discounts,
      paymentDetails: feeRecord.paymentDetails
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = exports;