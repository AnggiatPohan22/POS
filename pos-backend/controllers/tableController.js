const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose")

const addTable = async (req, res, next) => {
  try {
    let payload = req.body;

    // ✅ Jika user kirim array → batch insert
    if (Array.isArray(payload)) {
      const results = [];
      for (const item of payload) {
        const { tableNo, seats } = item;

        if (!tableNo) {
          continue; // skip data rusak
        }

        const exists = await Table.findOne({ tableNo });
        if (exists) {
          continue; // skip duplikasi
        }

        const created = new Table({ tableNo, seats });
        await created.save();
        results.push(created);
      }

      return res.status(201).json({
        success: true,
        message: "Batch table insert completed",
        inserted: results.length,
        data: results
      });
    }

    // ✅ Jika user kirim single object
    const { tableNo, seats } = payload;

    if (!tableNo) {
      const error = createHttpError(400, "Please provide Table No!");
      return next(error);
    }

    const isTablePresent = await Table.findOne({ tableNo });

    if (isTablePresent) {
      const error = createHttpError(400, "Table already exist");
      return next(error);
    }

    const newTable = new Table({ tableNo, seats });
    await newTable.save();

    res.status(201).json({
      success: true,
      message: "Table added!",
      data: newTable,
    });

  } catch (error) {
    return next(error);
  }
};


const getTable = async (req, res, next) => {
    try {
        
        const tables = await Table.find().sort({tableNo: 1}).populate({
            path: "currentOrder",
            select: "customerDetails"
        });
        res.status(200).json({success: true, data: tables});

    } catch (error) {
        return next(error);
    }
}

const updateTable = async (req, res, next) => {
    try {
        console.log("🟢 updateTable called with id:", req.params.id);
        console.log("🟡 Body:", req.body);

        const { status, orderId} = req.body;

        const { id } = req.params;
        
                if(!mongoose.Types.ObjectId.isValid(id)){
                    const error = createHttpError(404, "Invalid Id!");
                    return next (error);
                }

        const table = await Table.findByIdAndUpdate(
            id,
            { status, currentOrder: orderId },
            { new: true }
        );

        if(!table){
            const error = createHttpError(404, "Table not found!");
            return next(error);
        }

        res.status(200).json({success: true, message: "Table updated!",
            data: table
        });

    } catch (error) {
        console.log("🔴 Error in updateTable:", error);
        next(error);
    }
}

module.exports = {addTable, getTable, updateTable};
