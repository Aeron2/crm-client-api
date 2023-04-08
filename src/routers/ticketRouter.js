const express = require('express');

const router = express.Router();
const { insertTicket } = require('../model/ticket/TicketModel');

router.all('/', (req, res, next) => {
  // res.json({
  // message: ' return from ticket router ',

  // });
  next();
});
router.get('/', async (req, res, next) => {
  //recieve ticket
  try {
    const { subject, sender, message } = req.body;

    const ticketObj = {
      clientId: '64233099aa6980b704603153',
      subject,
      conversations: [
        {
          sender,
          message,
        },
      ],
    };
    const result = await insertTicket(ticketObj);
    if (result?._id) {
      return res.json({
        status: 'success',
        message: 'New ticket has been creatd successfully',
      });
    }
    res.json({
      status: 'error',
      message: 'Unabel to create new ticket try again later',
    });
  } catch (error) {
    res.json({
      status: 'error',
      message: error.message,
    });
  }

  //add to mongo
});
module.exports = router;
