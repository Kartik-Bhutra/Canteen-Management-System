const express = require('express');
const cms = require('./db');

const router = express.Router();

router.post('/order', (req, res) => {
    const insert_query = "INSERT INTO orders(user_email,ordered_items,order_price,order_time) VALUES(?,?,?,?)";
    cms.query(insert_query,Object.values(req.body),(err,order) => {
        if(err) return console.log(err);
        const io = req.app.get('socketio');
        io.to("admin@iitgoa.ac.in").emit('new_order', { id : order.insertId});
        res.json({
            id : order.insertId
        });
    });
});

module.exports = router;
