const e = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect(function(err) {
    if (err) {
        console.error('error connecting', + err.stack);
    } else {
        console.log('MySQL connected');
    }
});

exports.register = (req,res) => {
    console.log(req.body);
    const {firstname, lastname, email, password, confpassword} = req.body;

    db.query(`SELECT email FROM user_list where email = ?`, [email], async (err, result) => {
        if (err) console.log(err);
        if (result.length > 0) {
            return res.render('register', {message: 'Email entered is already in use'});
        } else if (password !== confpassword) {
            return res.render('register', {message: 'Password entered do not match'});
        }

        let encpass = await bcrypt.hash(password, 8);
        console.log(encpass);

        db.query(`INSERT into user_list SET ?`, {firstname: firstname, lastname: lastname, email: email, password: encpass}, (err,result) => {
            if (err) {console.log(err)}
            else {
                console.log(result);
                return res.render('register', {message: 'Successful sign-up'});
            }
        })
    });
}


exports.login = (req,res) => {
    console.log(req.body);

    const {email, password} = req.body;

    if (!email || !password) {
        res.status(400).render('/login', {message: 'Input credentials to log in'});
    }

    db.query(`SELECT * FROM user_list WHERE email = ?`, [email], async (err,result) => {
        if (!result || !(await bcrypt.compare(password, result[0].password))) {
            console.log(result);
            res.status(401).render('/login', {message: 'Email or Password is incorrect'})
        } else if (result[0].access === "admin" ) {
            const admin_id = result[0].user_id;
            const token = jwt.sign({admin_id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRESIN})
            console.log(token);
            const cookieoptions = {
                expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie('jwt', token, cookieoptions);
            res.render('admin')
        } else {
            const student_id = result[0].user_id;
            const token = jwt.sign({student_id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRESIN})
            console.log(token);
            const cookieoptions = {
                expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie('jwt', token, cookieoptions);
            res.render('studentprofile', {user: result[0]});
        }
    });
};


exports.deleteuser = (req,res) =>  {
    const email = req.params.email;

    db.query(`SELECT * from student_admission where email = ?`, [email], (err,result) => {
        if (err) throw err;
        db.query(`DELETE from student_admission where email = '${email}'`, (err,result) => {
            if (err) throw err;
            db.query(`SELECT * from student_admission`, (err,result) => {
                if (err) throw err;
                res.render('adminlistadmissions', {title: 'List of Users', user: result});
            })
        });
    });
}


exports.updateform = (req,res) => {
    const email = req.params.email;
    db.query(`SELECT * from student_admission where email = ?`, [email], (err, result) => {
        if (err) throw err;
        res.render('updateform', {title: 'Edit User', user: result[0]});
    });
};

exports.updateuser = (req,res) => {
    const {
        firstname,
        middlename,
        lastname,
        email,
        contact,
        // birthdate,
        gender,
        status,
        year,
        course,
        address,
        city,
        zip
    } = req.body;

    db.query(`UPDATE student_admission SET firstname = '${firstname}', middlename = '${middlename}', lastname = '${lastname}', email = '${email}', contact = '${contact}', gender = '${gender}', status = '${status}', year = '${year}', course = '${course}', address = '${address}', city = '${city}', zip = '${zip}' where email = '${email}'`, (err,result) => {
        if (err) throw err;
        console.log(result)
        db.query(`SELECT * FROM student_admission`, (err, result) => {
            if (err) throw err;
            res.render('adminlistadmissions', {title: 'List of Enrollees', user: result});
        });
    });
};


exports.addform = (req,res) => {
    res.render('addform');
};

exports.adduser = (req,res) => {
    console.log(req.body);

    const {
        firstname,
        middlename,
        lastname,
        email,
        contact,
        birthdate,
        gender,
        status,
        year,
        course,
        address,
        city,
        zip
    } = req.body;

    db.query(`SELECT email FROM student_admission where email = ?`, [email], async (err, result) => {
        if (err) {console.log(err)}
        else if (result.length > 0) {
            console.log(result);
            return res.render('addform', {message: 'Email entered is already in use'});
        }
        db.query(`INSERT into student_admission SET ?`, 
        {
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            email: email,
            contact: contact,
            birthdate: birthdate,
            gender: gender,
            status: status,
            year: year,
            course: course,
            address: address,
            city: city,
            zip: zip
        }, (err,result) => {
            if (err) {console.log(err)}
            else {
                console.log(result);
                // return res.render('addform', {message: 'Record has been added'});
                db.query(`SELECT * FROM student_admission`, (err, result) => {
                    if (err) throw err;
                    res.render('adminlistadmissions', {title: 'List of Users', user: result});
                });
            };
        });
        }
    );
}

exports.adminlist = (req,res) => {
    db.query(`SELECT * FROM user_list WHERE access = "admin"`, (err, result) => {
        if (err) throw err;
        res.render('adminlistusers', {title: 'List of Admin', user: result});
    });
}

exports.studentlist = (req,res) => {
    db.query(`SELECT * FROM student_admission`, (err, result) => {
        if (err) throw err;
        res.render('adminlistadmissions', {title: 'List of Enrollees', user: result});
    });
}


// ADMISSION FORM GET AND POST
// exports.admissionform = (req,res) => {
//     const email = req.params.email;

//     db.query(`SELECT * from user_list where email = ?`, [email], (err, result) => {
//         if (err) throw err;
//         res.render('admissionform', {title: 'Enroll Now', user: result[0]});
//     });
// };

// exports.admissionsubmit = (req,res) => {
//     console.log(req.body);

//     const {
//         firstname,
//         middlename,
//         lastname,
//         email,
//         contact,
//         birthdate,
//         gender,
//         status,
//         year,
//         course,
//         address,
//         city,
//         zip
//     } = req.body;

//     db.query(`SELECT email FROM user_list where email = ?`, [email], async (err, result) => {
//         if (err) {console.log(err)}
//         else if (!result) {
//             return res.render('admissionform', {message: 'Email is not registered. Please use the same email.'});
//         } else {
//         db.query(`INSERT into student_admission SET ?`, 
//         {
//             firstname: firstname,
//             middlename: middlename,
//             lastname: lastname,
//             email: email,
//             contact: contact,
//             birthdate: birthdate,
//             gender: gender,
//             status: status,
//             year: year,
//             course: course,
//             address: address,
//             city: city,
//             zip: zip
//         }, (err,result) => {
//             if (err) {console.log(err)}
//             else {
//                 console.log(result);
//                 return res.render('admissionform', {message: 'Admission form submitted'});
//             };
//            // res.render('studentprofile2', {user: result[0]});
//         });
//         }
//     });
// }

// exports.enrollment = (req,res) => {
//     console.log(req.body);

//     const {
//         firstname,
//         middlename,
//         lastname,
//         email,
//         contact,
//         birthdate,
//         gender,
//         status,
//         year,
//         course,
//         address,
//         city,
//         zip
//     } = req.body;

//     db.query(`SELECT email FROM student_admission where email = ?`, [email], async (err, result) => {
//         // if (err) {console.log(err)}
//         // else if (!result) {
//         //     console.log(result)
//         //     return res.render('admissionform', {message: 'Email is not registered. Please use the same email in account sign-up.'});
//         // } 
//         if (err) {console.log(err)}
//         else if (result.length > 0) {
//             console.log(result);
//             return res.render('enrollment', {message: 'Email entered is already in use'});
//         }
//         db.query(`INSERT into student_admission SET ?`, 
//         {
//             firstname: firstname,
//             middlename: middlename,
//             lastname: lastname,
//             email: email,
//             contact: contact,
//             birthdate: birthdate,
//             gender: gender,
//             status: status,
//             year: year,
//             course: course,
//             address: address,
//             city: city,
//             zip: zip
//         }, (err,result) => {
//             if (err) {console.log(err)}
//             else {
//                 console.log(result);
//                 return res.render('enrollment', {message: 'Admission form submitted'});
//             };
//            // res.render('studentprofile2', {user: result[0]});
//         });
//         }
//     );
// }