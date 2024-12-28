const mongoose = require("mongoose");

const sportsEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventType: {
    type: String,
    enum: ["competition", "practice", "tournament", "class"],
    required: true,
  },
  sportName: {
    type: String,
    required: true,
    trim: true,
  },
  venue: {
    type: String,
    required: true,
  },
  eligibleClasses: [
    {
      type: String,
      required: true,
    },
  ],
  registrationDeadline: {
    type: Date,
  },
  maxParticipants: {
    type: Number,
  },
  registeredStudents: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],


  coach: {
    type: String, // Changed to String
    required: true, // Coach name is now required
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SportsEvent", sportsEventSchema);
