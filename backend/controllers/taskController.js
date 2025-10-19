const mongoose = require('mongoose');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');
const { NotFoundError, BadRequestError } = require('../utils/apiError');

// ─── Helpers ────────────────────────────────────────────────

const combineDateAndTime = (date, timeStr) => {
    if (!date || !timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
};

const calculatePoints = (task, completedAt) => {
    const deadline = combineDateAndTime(task.scheduledDate, task.endTime);
    if (!deadline) return task.basePoints;
    const lateMs = completedAt - deadline;
    if (lateMs <= 5 * 60e3) return task.basePoints; // 5-min grace
    const penal = Math.min(0.9, Math.floor(lateMs / (30 * 60e3)) * 0.1);
    return Math.max(0, Math.round(task.basePoints * (1 - penal)));
};

// ─── Controllers ───────────────────────────────────────────

// 1️⃣ Create Task

exports.createTask = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        priority,
        scheduledDate,
        startTime,
        endTime,
        motivationText,
        rewardInfo,
        repeatRule,
        voicePreference
    } = req.body;

    // ✅ 1. Validate required fields
    if (!title || !scheduledDate || !startTime || !endTime || !priority) {
        return res.status(400).json({
            message: 'title, scheduledDate, startTime, endTime & priority are required.'
        });
    }

    // ✅ 2. Automatically set user from logged-in account
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User authentication required' });
    }

    // ✅ 3. Provide default basePoints if not sent
    const basePoints = req.body.basePoints || 10;

    // ✅ 4. Create task
    const task = await Task.create({
        title: title.trim(),
        description: description?.trim() || '',
        priority,
        scheduledDate,
        startTime,
        endTime,
        motivationText: motivationText || '',
        rewardInfo: rewardInfo || '',
        repeatRule: repeatRule || 'none',
        voicePreference: voicePreference || false,
        basePoints,
        user: req.user._id,
        status: 'active', // default status
    });

    return res.status(201).json({ task });
});


// 2️⃣ Get Tasks ±7 Days
exports.getTasks = asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!date) throw new BadRequestError('Query “date” (YYYY-MM-DD) is required.');
    const base = new Date(date);
    base.setHours(0, 0, 0, 0);
    const from = new Date(base); from.setDate(from.getDate() - 7);
    const to = new Date(base); to.setDate(to.getDate() + 7);

    const tasks = await Task.find({
        user: req.user._id,
        scheduledDate: { $gte: from, $lte: to }
    }).sort({ scheduledDate: 1, startTime: 1 }).lean();

    res.json({ tasks });
});

// 3️⃣ Get Single Task
exports.getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) throw new NotFoundError('Task not found.');
    res.json({ task });
});

// 4️⃣ Update Task
exports.updateTask = asyncHandler(async (req, res) => {
    const allowed = [
        'title', 'description', 'priority', 'scheduledDate', 'startTime', 'endTime',
        'motivationText', 'rewardInfo', 'reminder', 'repeat'
    ];
    const updates = {};
    for (let key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!task) throw new NotFoundError('Task not found.');
    res.json({ task });
});

// 5️⃣ Delete Task
exports.deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) throw new NotFoundError('Task not found.');
    res.json({ message: 'Task deleted.' });
});

// 6️⃣ Extend Task (increment, deadline, stopwatch)
exports.extendTask = asyncHandler(async (req, res) => {
    const { extensionType, value, userNotes } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) throw new NotFoundError('Task not found.');
    if (task.status !== 'active') throw new BadRequestError('Only active tasks can be extended.');

    const now = new Date();
    let event = { timestamp: now, details: { userNotes } };

    if (extensionType === 'stopwatch_start') {
        // Start stopwatch session
        event.type = 'delay_stopwatch_start';
        task.delaySessionStart = now;

    } else {
        const currEnd = combineDateAndTime(task.scheduledDate, task.endTime);
        if (!currEnd) throw new BadRequestError('Task has no end time to extend.');

        let newEnd;
        if (extensionType === 'increment') {
            newEnd = new Date(currEnd.getTime() + value * 60e3);
            event.type = 'delay_increment';
            event.details.incrementMinutes = value;

        } else if (extensionType === 'deadline') {
            newEnd = new Date(value);
            if (newEnd <= currEnd) throw new BadRequestError('New deadline must be after current.');
            event.type = 'delay_deadline';
            event.details.newDeadline = newEnd;

        } else {
            throw new BadRequestError('Invalid extension type.');
        }

        const delay = newEnd - currEnd;
        task.totalDelayMs = (task.totalDelayMs || 0) + delay;

        task.scheduledDate = newEnd;
        task.endTime = newEnd.toTimeString().slice(0, 5);
        task.extensionCount += 1;

        event.details.oldEndTime = currEnd;
        event.details.newEndTime = newEnd;
        event.details.delayMs = delay;
    }

    task.eventLog.push(event);
    await task.save();
    res.json({ task });
});

// 7️⃣ Complete Task (on_time or with_extension)
exports.completeTask = asyncHandler(async (req, res) => {
    const { userNotes } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) throw new NotFoundError('Task not found.');
    if (task.status !== 'active') throw new BadRequestError('Only active tasks can be completed.');

    const now = new Date();
    const plannedEnd = combineDateAndTime(task.scheduledDate, task.endTime);
    const BUFFER_MS = 5 * 60 * 1000; // 5-minute grace

    // If stopwatch session was running
    if (task.delaySessionStart) {
        const stopwatchDelay = now - plannedEnd;
        task.totalDelayMs = (task.totalDelayMs || 0) + Math.max(0, stopwatchDelay);
        delete task.delaySessionStart;
    }

    // Determine if task is considered on-time
    let isOnTime = true;
    if (plannedEnd && now > plannedEnd.getTime() + BUFFER_MS) {
        isOnTime = false;
    }
    if ((task.totalDelayMs || 0) > 0) {
        isOnTime = false;
    }

    const method = isOnTime ? 'completed_on_time' : 'completed_with_extension';

    task.earnedPoints = calculatePoints(task, now);
    task.rewardUnlocked = task.earnedPoints > 0;
    task.streak = isOnTime ? task.streak + 1 : 0;

    task.status = 'completed';
    task.completedAt = now;

    task.eventLog.push({
        type: method,
        timestamp: now,
        details: { userNotes, totalDelayMs: task.totalDelayMs || 0 }
    });

    await task.save();
    res.json({ task, message: isOnTime ? 'Task completed on time.' : 'Task completed with extension.' });
});

// 8️⃣ Backlog Task
exports.backlogTask = asyncHandler(async (req, res) => {
    const { userNotes } = req.body;
    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id, status: 'active' },
        {
            status: 'backlog',
            earnedPoints: 0,
            rewardUnlocked: false,
            streak: 0,
            $push: { eventLog: { type: 'backlogged', timestamp: new Date(), details: { userNotes } } }
        },
        { new: true }
    );
    if (!task) throw new NotFoundError('Active task not found.');
    res.json({ task });
});

// 9️⃣ Reactivate Task
exports.reactivateTask = asyncHandler(async (req, res) => {
    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id, status: { $ne: 'active' } },
        {
            status: 'active',
            completedAt: undefined,
            earnedPoints: 0,
            rewardUnlocked: false,
            $push: { eventLog: { type: 'reactivated', timestamp: new Date() } }
        },
        { new: true }
    );
    if (!task) throw new NotFoundError('Inactive task not found.');
    res.json({ task });
});

// 🔟 Get Task Stats
exports.getTaskStats = asyncHandler(async (req, res) => {
    const period = req.query.period || 'week';
    const start = new Date();
    if (period === 'week') start.setDate(start.getDate() - 7);
    if (period === 'month') start.setMonth(start.getMonth() - 1);
    else if (period === 'all') start.setTime(0);

    const userId = mongoose.Types.ObjectId(req.user._id);

    const summary = await Task.aggregate([
        { $match: { user: userId, createdAt: { $gte: start } } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalPoints: { $sum: '$earnedPoints' },
                avgPoints: { $avg: '$earnedPoints' }
            }
        },
        { $project: { _id: 0, status: '$_id', count: 1, totalPoints: 1, avgPoints: 1 } }
    ]);

    const comp = await Task.aggregate([
        { $match: { user: userId, status: 'completed', createdAt: { $gte: start } } },
        { $unwind: '$eventLog' },
        { $match: { 'eventLog.type': { $in: ['completed_on_time', 'completed_with_extension'] } } },
        { $group: { _id: '$eventLog.type', count: { $sum: 1 } } }
    ]);

    res.json({ summary, completionBreakdown: comp });
});

