const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


menuRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Menu;", (err, rows) => {
    if (rows) {
      res.status(200).json({'menus': rows});
    } else {
      res.json();
    }
  });
});

menuRouter.post('/', (req, res, next) => {
	const newMenu = req.body.menu;
	if (!newMenu.title) {
    	return res.sendStatus(400);
  	} else {
  		db.run('INSERT INTO Menu (title) values ($title)', {
  			$title: newMenu.title},
  			function (err) {
        	if (err) {
           		console.log("Error while inserting Menu data");
           		console.log(err);
           		return;
  			} else {
          		db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
            	(error, menu) => {
              	res.status(201).json({menu: menu});
            	});
            }
     		});
  	}
  });

menuRouter.get('/:menuId', (req, res, next) => {
  const empId = Number(req.params.menuId);

  		db.get(`SELECT * FROM Menu where id=$id;`, {
  			$id: empId,
  		},
  		(err, row) => {
    	if (err) {
      		res.status(404).json();
    	} else if (row) {
    		res.status(200).json({menu: row});
    	} else {
      		res.sendStatus(404);
    	}
  		});

});

menuRouter.put('/:menuId', (req, res, next) => {
	const empId = Number(req.params.menuId);
	const title = req.body.menu.title;

	if (!title  ) {
    	return res.sendStatus(400);
  	}

	const sql = 'UPDATE Menu set title = $title WHERE Menu.id = $id';
	const values = {
		$title: title,
		$id: empId,
	};

	db.run(sql,values,function(err) {
		if (err) {
      		res.status(400).json();
    	} else {
    	    db.get(`SELECT * FROM Menu WHERE Menu.id = ${empId}`,
        	(error, emp) => {
          		res.status(200).json({menu: emp});
        	});
    	}
	});
});


menuRouter.delete('/:menuId', (req, res, next) => {
  const menuSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const menuValues = {$menuId: req.params.menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const deleteValues = {$menuId: req.params.menuId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});


menuRouter.get('/:menuId/menu-items', (req, res, next) => {
	const menuId = req.params.menuId;
  	db.all(`SELECT * FROM MenuItem where menu_id=$menuId`, {
  		$menuId: menuId,
  	},
  	(err, row) => {
    	if (err) {
      		res.status(404).json();
    	} else if (row) {
    		res.status(200).json({menuItems: row});
    	} else {
      		res.sendStatus(404);
    	}
  	});

});

menuRouter.post('/:menuId/menu-items', (req, res, next) => {
	const newMenu = req.body.menuItem;
	if (!newMenu.name || !newMenu.description || !newMenu.inventory || !newMenu.price) {
    	return res.sendStatus(400);
  	} else {
  		db.run('INSERT INTO MenuItem (menu_id, name, description, inventory, price) values ($menuId, $name,$description,$inventory,$price)', {
  			$menuId: req.params.menuId,
  			$name: newMenu.name,
			$description: newMenu.description,
			$inventory: newMenu.inventory,
			$price: newMenu.price },
  		function (err) {
        	if (err) {
           		console.log("Error while inserting Menu data");
           		console.log(err);
           		return;
  			} else {
          		db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            	(error, menu) => {
              	res.status(201).json({menuItem: menu});
            	});
            }

		});
  	} //end else
});


menuRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const issueSql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId ';
  const issueValues = {$menuItemId: req.params.menuItemId};
  db.get(issueSql, issueValues, (error, issue) => {
    if (error || !issue)  {
      res.status(404).json();
    } else {

	const menuId= Number(req.params.menuId);
	const menuItemId= Number(req.params.menuItemId);
	const name = req.body.menuItem.name,
			description = req.body.menuItem.description,
			inventory = req.body.menuItem.inventory;
			price = req.body.menuItem.price;
	
	if (!name || !description || !inventory || !price || !menuItemId) {
    	return res.sendStatus(400);
  	}

	const sql = 'UPDATE MenuItem set name=$name, description=$description, inventory=$inventory, price=$price WHERE  MenuItem.menu_id = $menuId AND MenuItem.id = $menuItemId';
	const values = {
		$menuId: menuId,
		$name: name,
		$description: description,
		$price: price,
		$inventory: inventory,
		$menuItemId: menuItemId,
	};


	db.run(sql,values,function(error) {
		if (error) {
			//next(error);
      		res.status(404).json();
    	} else {
    	    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${menuItemId}`,
        	(error, menuItem) => {
          		res.status(200).json({menuItem: menuItem});
        	});
    	}
	});
	}
	});
});

menuRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const issueSql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId ';
  const issueValues = {$menuItemId: req.params.menuItemId};
  db.get(issueSql, issueValues, (error, issue) => {
    if (error || !issue)  {
      res.status(404).json();
    } else {

  const menuId= Number(req.params.menuId);
  const menuItemId= Number(req.params.menuItemId);
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId AND MenuItem.menu_id = $menuId';
  const values = {$menuItemId: menuItemId, $menuId: menuId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });

}
});
});


module.exports = menuRouter;