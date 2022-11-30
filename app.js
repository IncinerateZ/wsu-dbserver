const sql = require('sqlite3').verbose();

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

const app = express();
const port = parseInt(process.env.PORT);

app.use(bodyParser.json());
app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));
app.use(cookieParser());

app.get('/auth', (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    if (!req.query.email || !req.query.password) {
        if (req.cookies.AUTHORIZED)
            return res.json({ message: 'Authenticated' });
        return res.json({ error: 'Not Authenticated', redirect: '/login' });
    }

    db.get(
        `select * from employee where employee_email = '${req.query.email}' and employee_password = '${req.query.password}';`,
        [],
        (err, rows) => {
            if (err) return res.json({ error: err });
            if (!rows) return res.json({ error: 'Invalid Credentials' });
            if (rows.employee_isFired)
                return res.json({ error: 'That employee has been fired!' });
            delete rows.employee_password;
            res.cookie('AUTHORIZED', '' + rows.employee_isAdmin, {
                expires: new Date(new Date().getTime() + 86_400_000),
                // httpOnly: true,
                // sameSite: 'none',
                // secure: true,
            });
            return res.json({ ...rows, redirect: '/' });
        },
    );
});

app.get('/logout', (req, res) => {
    res.clearCookie('AUTHORIZED', {});
    res.json({ message: 'Logged out', redirect: '/login' });
});

app.get('/register', (req, res) => {
    if (
        !req.query.firstname ||
        !req.query.lastname ||
        !req.query.email ||
        !req.query.password ||
        !req.query.address
    )
        return res.json({ error: 'Missing Fields' });
    db.run(
        `insert into employee (employee_firstname, employee_lastname, employee_joindate, employee_address, employee_email, employee_password) values ('${req.query.firstname}', '${req.query.lastname}', DATE(), '${req.query.address}', '${req.query.email}', '${req.query.password}');`,
        [],
        (r, err) => {
            if (err) return res.json({ error: err });
            return res.json({
                message: 'Registered Successfuly',
                redirect: '/login',
            });
        },
    );
});

app.get('/get', (req, res) => {
    let keys = Object.keys(req.query);
    keys = keys.filter((i) => i !== 'table');
    let q = `select * from ${req.query.table} ${
        keys.length > 0
            ? `where ${req.query.table}_${keys[0]} LIKE '%${
                  req.query[keys.shift()]
              }%' ${
                  keys.length > 0
                      ? `and ${req.query.table}_${keys[0]} LIKE '%${
                            req.query[keys.shift()]
                        }%'`
                      : ''
              }`
            : ''
    }`;
    db.all(q, (err, rows) => {
        return res.json(rows);
    });
});

app.get('/add', (req, res) => {
    if (!req.query.table) return res.json({ error: 'Missing args' });
    let keys = Object.keys(req.query);
    keys = keys.filter((i) => i !== 'table');

    let cols = '(';
    for (let i = 0; i < keys.length; i++) {
        cols += (keys[i].includes('_') ? '' : req.query.table + '_') + keys[i];
        if (i !== keys.length - 1) cols += ',';
    }
    cols += ')';

    if (req.query.table === 'restock')
        cols = cols.substring(0, cols.length - 1) + ',restock_date)';
    if (req.query.table === 'employee')
        cols = cols.substring(0, cols.length - 1) + ',employee_joindate)';

    let vals = '(';
    for (let i = 0; i < keys.length; i++) {
        vals +=
            (!keys[i].includes('id') &&
            !keys[i].includes('stock') &&
            !keys[i].includes('price') &&
            !keys[i].includes('cost') &&
            !keys[i].includes('cost') &&
            !keys[i].includes('kg') &&
            keys[i].substring(0, 2) !== 'is'
                ? "'"
                : '') +
            req.query[keys[i]] +
            (!keys[i].includes('id') &&
            !keys[i].includes('stock') &&
            !keys[i].includes('price') &&
            !keys[i].includes('cost') &&
            !keys[i].includes('cost') &&
            !keys[i].includes('kg') &&
            keys[i].substring(0, 2) !== 'is'
                ? "'"
                : '');
        if (i !== keys.length - 1) vals += ',';
    }
    vals += ')';

    if (req.query.table === 'restock' || req.query.table === 'employee')
        vals = vals.substring(0, vals.length - 1) + ',DATE())';

    db.run(
        `insert into ${req.query.table} ${cols} values ${vals};`,
        [],
        (r, err) => {
            if (err) return res.json({ error: err });
            return res.json({ message: 'Success' });
        },
    );
});

//connect
console.log('Establishing SQLite Database connection...');
const db = new sql.Database('./db/ecommerce.db', (err) => {
    if (err) return console.log(err);
    console.log('Connected to SQLite');

    console.log('Starting Express Server...');
    app.listen(3001, () => {
        console.log('Server started at http://127.0.0.1:3001');
    });
});
