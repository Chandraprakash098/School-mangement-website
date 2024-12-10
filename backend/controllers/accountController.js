



const Fees = require('../models/Account');
const User = require('../models/User');

// Create Fee Record
exports.createFeeRecord = async (req, res) => {
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
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    // Check for existing fee record
    const existingFeeRecord = await Fees.findOne({
      student: studentId,
      academicYear,
      semester
    });

    if (existingFeeRecord) {
      return res.status(400).json({ message: 'Fee record already exists for this student and semester' });
    }

    // Create new fee record
    const feeRecord = new Fees({
      student: studentId,
      academicYear,
      semester,
      feeStructure,
      discounts: discounts || [],
      dueDate
    });

    await feeRecord.save();
    console.log(`Fee record created for student ${studentId}`);
    res.status(201).json(feeRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Process Fee Payment
exports.processFeePayment = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { 
      amountPaid, 
      paymentMethod, 
      receiptNumber 
    } = req.body;

    const feeRecord = await Fees.findById(feeId);
    if (!feeRecord) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // Add payment details
    feeRecord.paymentDetails.push({
      amountPaid,
      paymentMethod,
      receiptNumber,
      paymentStatus: 'Completed'
    });

    await feeRecord.save();
    res.json(feeRecord);
  } catch (err) {
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

module.exports = exports;