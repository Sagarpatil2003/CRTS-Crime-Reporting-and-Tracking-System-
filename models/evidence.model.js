const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  caseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Case', 
    required: true, 
    index: true 
  },
  
  evidenceType: { 
    type: String, 
    enum: ['IMAGE', 'VIDEO', 'DOCUMENT', 'WITNESS_STATEMENT'], 
    required: true 
  },

  fileUrl: String,
  fileMimeType: String, // e.g., 'image/jpeg'
  fileSize: Number,    // Store in bytes

  witnessInfo: {
    name: { type: String, trim: true },
    contact: { type: String, trim: true },
    statement: { type: String },
    isVerified: { type: Boolean, default: false }
  },

  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
    index: true // Useful for the Officer's "To-be-verified" dashboard
  }
  
}, { timestamps: true });


// This hook ensures that if the type is 'WITNESS_STATEMENT', a fileUrl isn't required, 
// and vice versa. This is called "Data Integrity."

EvidenceSchema.pre('save', function(next) {
  if (this.evidenceType === 'WITNESS_STATEMENT' && !this.witnessInfo.statement) {
    return next(new Error('Witness statement text is required for this evidence type.'));
  }
  if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.evidenceType) && !this.fileUrl) {
    return next(new Error('File URL is required for media evidence.'));
  }
  next
});

module.exports = mongoose.model('Evidence', EvidenceSchema);