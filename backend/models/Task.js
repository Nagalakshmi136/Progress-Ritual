const mongoose = require('mongoose');

// Sub-schema for task lifecycle events
const eventLogSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'created',
            'completed_on_time',
            'completed_with_extension',
            'backlogged',
            'reactivated',
            'delay_increment',
            'delay_deadline',
            'delay_stopwatch_start'
        ]
    },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const taskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // --- Scheduling ---
    scheduledDate: {
        type: Date,
        required: true,
        set: v => new Date(v).setUTCHours(0, 0, 0, 0),
        index: true
    },
    startTime: {
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format']
    },
    endTime: {
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format']
    },

    // --- Priority & Status ---
    priority: {
        type: String,
        required: true,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'backlog'],
        default: 'active',
        required: true,
        index: true
    },

    // --- Reminders & Motivation ---
    reminder: {
        timeBefore: { type: Number },
        type: { type: String, enum: ['notification', 'voice'], default: 'notification' }
    },
    motivationText: { type: String, trim: true },

    // --- Rewards ---
    rewardInfo: { type: String, trim: true },
    rewardUnlocked: { type: Boolean, default: false },
    basePoints: { type: Number, required: true },
    earnedPoints: { type: Number, default: 0 },

    // --- Analytics ---
    completedAt: { type: Date },
    extensionCount: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },

    // NEW: Track delays
    totalDelayMs: { type: Number, default: 0 },

    // NEW: Active stopwatch session
    delaySessionStart: { type: Date },

    // Event logs
    eventLog: [eventLogSchema],

}, { timestamps: true });

// ─── Auto Set Points ──────────────────────────────────────────
taskSchema.pre('save', function (next) {
    if (this.isModified('priority') || this.isNew) {
        const priorityPoints = { High: 100, Medium: 50, Low: 25 };
        this.basePoints = priorityPoints[this.priority] || 50;
        if (this.status === 'active') this.earnedPoints = 0;
    }
    next();
});

// ─── Auto Create Event ───────────────────────────────────────
taskSchema.pre('save', function (next) {
    if (this.isNew) {
        this.eventLog.push({ type: 'created', timestamp: new Date() });
    }
    next();
});

// ─── Index for Performance ───────────────────────────────────
taskSchema.index({ user: 1, scheduledDate: 1, status: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
