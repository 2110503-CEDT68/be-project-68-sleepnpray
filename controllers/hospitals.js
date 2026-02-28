const Hospitals = require("../models/Hospitals");
const Appointment = require("../models/Appointment");


exports.getHospitals = async (req, res,next) => {
    try {
        let query;

        const reqQuery = { ...req.query };
        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Remove fields from query
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Hospitals.find(JSON.parse(queryStr)).populate('appointments');

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else{
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Hospitals.countDocuments();

        query = query.skip(startIndex).limit(limit);

        const hospitals = await query;

        // pagination res
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({ success: true, count: hospitals.length, pagination, data: hospitals });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
    }
}

exports.getHospital = async (req, res,next) => {
    try {
        const hospital = await Hospitals.findById(req.params.id);
        console.log(hospital,req.params.id);
        if (!hospital) {
            return res.status(400).json({ success: false});
        }
        
        res.status(200).json({ success: true, data: hospital });
    } catch (err) {
        res.status(400).json({ success: false });
    }   
}

exports.createHospital = async(req, res,next) => {
    const hospital = await Hospitals.create(req.body)
    res.status(201).json({ success: true, data:hospital });
}

exports.updateHospital = async (req, res,next) => {
    try {
        const hospital = await Hospitals.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!hospital) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: hospital });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

exports.deleteHospital = async (req, res,next) => {
    try {
        const hospital = await Hospitals.findById(req.params.id);
        if (!hospital) {
            return res.status(400).json({ success: false });
        }

        await Appointment.deleteMany({ hospital: req.params.id });
        await hospital.deleteOne({_id: req.params.id});
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}