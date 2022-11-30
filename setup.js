const sql = require('sqlite3').verbose();

//connect
let db = new sql.Database('./db/ecommerce.db', (err) => {
    if (err) return console.log(err);
    console.log('Connected to SQLite');
});

db.serialize(function () {
    //create tables

    //employee
    db.run(
        'create table employee (employee_id integer primary key AUTOINCREMENT,employee_firstname varchar(45) NOT NULL,employee_lastname varchar(45),employee_joindate date NOT NULL,employee_address varchar(255) NOT NULL,employee_email varchar(255) NOT NULL, employee_password varchar(15) NOT NULL, employee_isAdmin boolean NOT NULL default false);',
    );

    //product
    db.run(
        'create table product (product_id integer primary key autoincrement,product_name varchar(255) not null,product_description varchar(255) not null,product_stock integer not null default 0,product_price integer not null);',
    );

    //supplier
    db.run(
        'create table supplier (supplier_id integer primary key autoincrement,supplier_name varchar(255) not null,supplier_address varchar(255) not null,supplier_phonenum varchar(15) not null,supplier_isActive boolean not null default true);',
    );

    //supply
    db.run(
        'create table supply (supply_id integer primary key autoincrement,supplier_id integer not null,product_id integer not null,supply_cost float not null,supply_kg float not null,foreign key (supplier_id) references supplier(supplier_id),foreign key (product_id) references product(product_id));',
    );

    //restock
    db.run(
        'create table restock (restock_id integer primary key autoincrement,supply_id integer not null,employee_id integer not null,restock_kg float not null,restock_date date not null,foreign key (employee_id) references employee(employee_id),foreign key (supply_id) references supply(supply_id));',
    );

    //fill in data

    //employee
    db.run(
        "insert into employee values (1,'John','Doe',DATE(),'25 Waterpark Ave','johndoe@amazon.com', 'johndoe', true);",
    );

    db.run(
        "insert into employee (employee_firstname,employee_lastname, employee_joindate, employee_address,employee_email, employee_password) values ('Alice','Lee',DATE(),'27 Silicon Valley','alicelee@amazon.com', 'alicelee'), ('Tim',    'Woods',    date(),    '32 jayang-dong',    'timwoods@amazon.com', 'timwoods'), (    'Jeff',    'Bezos',    date(),    '1 Circular Quay',    'jeffbezos@amazon.com', 'jeffbezos'), (    'Mark',    'Zuckerberg',    date(),    '20 Bloom Ave',    'zuck@facebook.com', 'zuck');",
    );

    //product
    db.run(
        "insert into product values (1, 'Samsung S20', 'Previous Samsung flagship phone', 100, 999.99);",
    );

    db.run(
        "insert into product (product_name, product_description, product_stock, product_price) values ('Samsung S22', 'Latest flagship phone from Samsung', 50, 1200), ('Samsung Z Flip', 'Samsung flip phone', 50, 1500), ('iPhone 9', '\"The best iPhone ever\"', 200, 999), ('iPhone X', '\"The best iPhone ever\"', 200, 999), ('iPhone 12 Pro', '\"The best iPhone ever\"', 500, 1250);",
    );

    //supplier
    db.run(
        "insert into supplier values (1, 'Samsung', 'South Korea', '01012345678', true);",
    );

    db.run(
        "insert into supplier (supplier_name, supplier_address, supplier_phonenum) values ('Apple', 'USA', '987654321'), ('Motorola', 'USA', '1762371621'), ('Google', 'USA', '8734814316'), ('Blackberry', 'EU', '123716573');",
    );

    //supply
    db.run('insert into supply values (1, 1, 1, 750, 3);');

    db.run(
        'insert into supply (supplier_id, product_id, supply_cost, supply_kg) values (1, 2, 700, 3), (1, 3, 850, 2.5), (2, 4, 500, 4), (2, 5, 510, 3.5), (2, 6, 550, 3.65);',
    );

    //restock
    db.run('insert into restock values (1, 1, 1, 1000, DATE());');

    db.run(
        'insert into restock (supply_id, employee_id, restock_kg, restock_date) values (2,2,1200, DATE()), (3, 3, 1500, date()), (4, 4, 500, date()), (5, 1, 500, date()), (1, 3, 500, date()), (3, 1, 850, date());',
    );

    //verify
    db.all('select * from employee', [], (err, rows) => {
        if (err) return console.log(err);
        console.log(rows);
    });

    db.close((err) => {
        if (err) return console.log(err);
        console.log('SQLite connection closed, Setup complete.');
    });
});
