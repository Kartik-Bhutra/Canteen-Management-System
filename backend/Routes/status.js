const express = require('express');
const cms = require('./db');

const router = express.Router();

router.post('/status', (req, res) => {
    const {id,status,email} = req.body;
    const insert_query = "UPDATE orders SET order_status = ? WHERE order_id = ?";
    cms.query(insert_query,[status,id],(err,order) => {
        if(err) return console.log(err);
        const io = req.app.get('socketio');
        io.to(email).emit('status_change', { orderId: id, status });
        return res.json({
            order_id: id
        });
    });
});

module.exports = router;
