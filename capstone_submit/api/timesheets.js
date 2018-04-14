const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else if (timesheets) {
      req.timesheets = timesheets;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
  const values = { $employeeId: req.params.employeeId};
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});




timesheetsRouter.get('/:timesheetId', (req, res, next) => {
  res.status(200).json({timesheets: req.timesheet});
});

timesheetsRouter.post('/', (req, res, next) => {
  const empId = req.params.employeeId,
        hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;
  if (!empId || !rate || !hours || !date) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Timesheet (employee_id, hours, rate, date) VALUES ($empId, $hours, $rate, $date)';
  const values = {
    $empId: empId,
    $hours: hours,
    $rate: rate,
    $date: date
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        (error, timesheet) => {
          res.status(201).json({timesheet: timesheet});
        });
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const empId = req.params.employeeId,
        timesheetId = req.params.timesheetId,
        hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        all = req.body.timesheet;
        
  if (!empId || !rate || !hours || !date) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, date = $date, rate = $rate ' +
      'WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $timesheetId: timesheetId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${timesheetId}`,
        (error, timesheet) => {
          res.status(200).json({timesheet: timesheet});
        });
    };
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: req.params.timesheetId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});





module.exports = timesheetsRouter;