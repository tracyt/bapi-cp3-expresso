const createEmployeeTable = () => {
  return 'create table `Employee` (`id` INTEGER NOT NULL, `name` TEXT NOT NULL, `position` TEXT NOT NULL, `wage` INT NOT NULL, `is_current_employee` INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(`id`))';
}
const createTimesheetTable = () => {
  return 'create table Timesheet (`id` INTEGER NOT NULL, `hours` INT NOT NULL, `rate` INT NOT NULL, date INT NOT NULL, `employee_id` INT NOT NULL, PRIMARY KEY(`id`), FOREIGN KEY (employee_id) REFERENCES Employee(id))';
}
const createMenuTable = () => {
  return 'create table Menu (`id` INTEGER NOT NULL, `title` TEXT NOT NULL, PRIMARY KEY(`id`))';
}
const createMenuItemTable = () => {
  return 'create table MenuItem (`id` INTEGER NOT NULL, `name` TEXT NOT NULL, `description` TEXT, `inventory` INT NOT NULL, `price` INT NOT NULL, `menu_id` INT NOT NULL, PRIMARY KEY(`id`), FOREIGN KEY (menu_id) REFERENCES Menu(id))';
}


module.exports = {
  	createEmployeeTable, 
	createTimesheetTable,
	createMenuTable,
	createMenuItemTable
}