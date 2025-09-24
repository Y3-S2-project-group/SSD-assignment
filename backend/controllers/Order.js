const Order = require("../models/Order");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
    try {
        const { user, item, address, status, paymentMode, total } = req.body;

        const created = new Order({
            user,
            item,
            address,
            status,
            paymentMode,
            total
        });

        await created.save();
        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating an order, please try again later" });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        //Validating ObjectIds
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const results = await Order.find({ user: id });
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching orders, please try again later" });
    }
};

exports.getAll = async (req, res) => {
    try {
        let skip = 0
        let limit = 0

        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit, 10);
            const page = parseInt(req.query.page, 10);

            if (isNaN(pageSize) || isNaN(page) || page < 1) {
                return res.status(400).json({ message: "Invalid pagination params" });
            }

            skip = pageSize * (page - 1);
            limit = pageSize;
        }

        const totalDocs = await Order.find({}).countDocuments().exec()
        const results = await Order.find({}).skip(skip).limit(limit).exec()

        res.header("X-Total-Count", totalDocs)
        res.status(200).json(results)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching orders, please try again later' })
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }
        const updated = await Order.findByIdAndUpdate(id, req.body, { new: true })
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating order, please try again later' })
    }
}
