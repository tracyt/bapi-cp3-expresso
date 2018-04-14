const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const {createEmployeeTable,createTimesheetTable,createMenuTable,createMenuItemTable} = require('../migration');
const timesheetsRouter = require('./timesheets.js');



employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);


employeeRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Employee where is_current_employee=1;", (err, rows) => {
    if (rows) {
      res.status(200).json({'employees': rows});
    } else {
      res.json();
    }
  });
});

employeeRouter.post('/', (req, res, next) => {
	const newEmployee = req.body.employee;
	if (!newEmployee.name || !newEmployee.position || !newEmployee.wage) {
    	return res.sendStatus(400);
  	} else {
  		db.run('INSERT INTO Employee (name, position, wage) values ($name,$position,$wage)', {
  			$name: newEmployee.name,
			$position: newEmployee.position,
			$wage: newEmployee.wage },
  		function (err) {
        	if (err) {
           		console.log("Error while inserting Employee data");
           		console.log(err);
           		return;
  			} else {
          		db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
            	(error, emp) => {
              	res.status(201).json({employee: emp});
            	});
            }

		});
  	} //end else
});




employeeRouter.get('/:employeeId', (req, res, next) => {
  const empId = Number(req.params.employeeId);
  		db.get(`SELECT * FROM Employee where id=$id;`, {
  			$id: empId,
  		},
  		(err, row) => {
    	if (err) {
      		res.status(404).json();
    	} else if (row) {
    		res.status(200).json({employee: row});
    	} else {
      		res.sendStatus(404);
    	}
  		});


});

employeeRouter.put('/:employeeId', (req, res, next) => {
	const empId = Number(req.params.employeeId);
	const name = req.body.employee.name,
			position = req.body.employee.position,
			wage = req.body.employee.wage;
	if (!name || !position || !wage ) {
    	return res.sendStatus(400);
  	}

	const sql = 'UPDATE Employee set name = $name, position = $position, wage = $wage WHERE Employee.id = $id';
	const values = {
		$name: name,
		$position: position,
		$wage: wage,
		$id: empId,
	};

	db.run(sql,values,function(err) {
		if (err) {
      		res.status(400).json();
    	} else {
    	    db.get(`SELECT * FROM Employee WHERE Employee.id = ${empId}`,
        	(error, emp) => {
          		res.status(200).json({employee: emp});
        	});
    	}
	});
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
	const empId = Number(req.params.employeeId);

	const sql = 'UPDATE Employee set is_current_employee=0  WHERE Employee.id = $id';
	const values = {
		$id: empId,
	};

	db.run(sql,values,function(err) {
		if (err) {
      		res.status(400).json();
    	} else {
    		//res.sendStatus(200);
    	    db.get(`SELECT * FROM Employee WHERE Employee.id = ${empId}`,
        	(error, emp) => {
          		res.status(200).json({employee: emp});
        	});
    	}
	});

});


db.serialize(() => {
  db.run("DROP TABLE IF EXISTS Employee;");
  db.run("DROP TABLE IF EXISTS Timesheet;");
  db.run("DROP TABLE IF EXISTS Menu;");
  db.run("DROP TABLE IF EXISTS MenuItem;");

  const createEmployee = createEmployeeTable();
  const createTimesheet = createTimesheetTable();
  const createMenu = createMenuTable();
  const creatMenuItem = createMenuItemTable();
    
if (createEmployee) {

 db.run(createEmployee, err => {
        if (err) {
          console.log("Error while creating the Employee table!");
          console.log(err);
          return;
        }
      });
}

if (createTimesheet) {
  db.run(createTimesheet, err => {
        if (err) {
          console.log("Error while creating the Timesheet table!");
          console.log(err);
          return;
        }
      });
}
if (createMenu) {
   db.run(createMenu, err => {
        if (err) {
          console.log("Error while creating the Menu table!");
          console.log(err);
          return;
        }
      });
}
if (creatMenuItem) {
    db.run(creatMenuItem, err => {
        if (err) {
          console.log("Error while creating the MenuItem table!");
          console.log(err);
          return;
        }
      });
}

}); //end serialize




module.exports = employeeRouter;
