const mongoose = require('mongoose');

const FeesSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['First Semester', 'Second Semester', 'Annual'],
    required: true
  },
  feeStructure: {
    tuitionFee: {
      amount: {
        type: Number,
        required: true
      },
      isPaid: {
        type: Boolean,
        default: false
      }
    },
    libraryFee: {
      amount: {
        type: Number,
        default: 0
      },
      isPaid: {
        type: Boolean,
        default: false
      }
    },
    transportationFee: {
      amount: {
        type: Number,
        default: 0
      },
      isPaid: {
        type: Boolean,
        default: false
      }
    },
    laboratoryFee: {
      amount: {
        type: Number,
        default: 0
      },
      isPaid: {
        type: Boolean,
        default: false
      }
    },
    examFee: {
      amount: {
        type: Number,
        default: 0
      },
      isPaid: {
        type: Boolean,
        default: false
      }
    },
    otherFees: {
      amount: {
        type: Number,
        default: 0
      },
      description: {
        type: String
      },
      isPaid: {
        type: Boolean,
        default: false
      }
    }
  },
  totalFeeAmount: {
    type: Number,
  },
  discounts: [{
    type: {
      type: String,
      enum: [
        'Merit Scholarship', 
        'Financial Aid', 
        'Sibling Discount', 
        'Early Payment Discount'
      ]
    },
    amount: {
      type: Number,
      default: 0
    }
  }],
  paymentDetails: [{
    amountPaid: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: [
        'Cash', 
        'Bank Transfer', 
        'Online Payment', 
        'Cheque', 
        'Draft'
      ]
    },
    receiptNumber: {
      type: String,
      default: null // Change to allow null by default
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Partial'],
      default: 'Pending'
    }
  }],
  dueDate: {
    type: Date,
    required: true
  },
  remainingBalance: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
    default: 'Unpaid'
  },
  notes: {
    type: String
  }
}, { 
  timestamps: true,
  // Remove unique index on receiptNumber
  // Add a compound unique index if needed
  // Indices can be defined separately using mongoose.model
});

// Remove unique constraint on receiptNumber
FeesSchema.index({ 'paymentDetails.receiptNumber': 1 }, { unique: false });

// Pre-save middleware to calculate total fee amount and remaining balance
FeesSchema.pre('save', function(next) {
  const feeStructure = this.feeStructure;
  
  // Calculate total fee amount
  this.totalFeeAmount = 
    feeStructure.tuitionFee.amount +
    feeStructure.libraryFee.amount +
    feeStructure.transportationFee.amount +
    feeStructure.laboratoryFee.amount +
    feeStructure.examFee.amount +
    feeStructure.otherFees.amount;

  // Apply discounts
  const totalDiscounts = this.discounts.reduce((total, discount) => 
    total + discount.amount, 0);
  
  this.totalFeeAmount -= totalDiscounts;

  // Calculate remaining balance
  const totalPaid = this.paymentDetails.reduce((total, payment) => 
    total + payment.amountPaid, 0);
  
  this.remainingBalance = this.totalFeeAmount - totalPaid;

  // Update payment status
  if (this.remainingBalance === 0) {
    this.paymentStatus = 'Fully Paid';
  } else if (totalPaid > 0) {
    this.paymentStatus = 'Partially Paid';
  } else {
    this.paymentStatus = 'Unpaid';
  }

  next();
});

module.exports = mongoose.model('Fees', FeesSchema);