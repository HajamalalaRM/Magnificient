var express = require('express');
var router = express.Router();
const appointmentsModel = require('../models/appointments.model')

/* GET home page. */
router.get('/reservation_day_month', function(req, res) {
    appointmentsModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$datetime" },
              month: { $month: "$datetime" },
              day: { $dayOfMonth: "$datetime" }
            },
            nbr: { $sum: 1 } // Count appointments
          }
        },
        {
          $sort: {
            "_id.month": 1,
            "_id.day": 1 // Sort by day within each month
          }
        },
        {
          $group: {
            _id: {
              year: "$_id.year",
              month: "$_id.month"
            },
            days: {
              $push: {
                day: "$_id.day",
                count: "$nbr"
              }
            },
            monthAppointments: { $sum: "$nbr" } // Sum of appointments for each month
          }
        }
      ])
    .then(services=>{
        res.send({status:200, services: services});
    })    
});

// db.appointments.aggregate([
//     {
//       $group: {
//         _id: {
//           year: { $year: "$datetime" },
//           month: { $month: "$datetime" },
//           day: { $dayOfMonth: "$datetime" }
//         },
//         count: { $sum: 1 } 
//       }
//     },
//     {
//       $sort: {
//         "_id.month": 1,
//         "_id.day": 1 // Sort by day within each month
//       }
//     },
//     {
//       $group: {
//         _id: {
//           year: "$_id.year",
//           month: "$_id.month"
//         },
//         days: {
//           $push: {
//             day: "$_id.day",
//             count: "$count"
//           }
//         },
//         totalAppointments: { $sum: "$count" } 
//       }
//     }
//   ]);
module.exports = router;