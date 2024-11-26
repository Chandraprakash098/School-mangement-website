const Account = require('../models/Account');
const User = require('../models/User');

// Create Employee Account
exports.createEmployeeAccount = async (req, res) => {
  try {
    const { 
      userId,
      employeeId,
      position,
      department,
      salary,
      bankDetails,
      employmentType,
      joinDate,
      contactInformation,
      documents
    } = req.body;

    // Verify user exists and is a teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid user or user is not a teacher' });
    }

    // Check if account already exists
    const existingAccount = await Account.findOne({ 
      $or: [
        { user: userId },
        { employeeId: employeeId }
      ]
    });

    if (existingAccount) {
      return res.status(400).json({ message: 'Account already exists for this user' });
    }

    // Create new account
    const account = new Account({
      user: userId,
      employeeId,
      position,
      department,
      salary,
      bankDetails,
      employmentType,
      joinDate,
      contactInformation,
      documents
    });

    await account.save();
    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Employee Account Details
exports.getEmployeeAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const account = await Account.findOne({ user: userId })
      .populate('user', 'name email');

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update Employee Account
exports.updateEmployeeAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const account = await Account.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get All Employee Accounts
exports.getAllEmployeeAccounts = async (req, res) => {
  try {
    const accounts = await Account.find()
      .populate('user', 'name email');

    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Upload Employee Documents
exports.uploadDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { documentType, documentUrl } = req.body;

    const account = await Account.findOne({ user: userId });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    account.documents.push({
      documentType,
      documentUrl,
      uploadDate: new Date()
    });

    await account.save();
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports = exports;