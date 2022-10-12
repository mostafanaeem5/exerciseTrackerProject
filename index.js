const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user').user;
const userExcercise = require('./models/user').exercise;
const bodyParser = require('body-parser');
const { user } = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/users', (req, res) => {
    User.find()
        .lean()
        .exec((err, users) => {
            return res.send(JSON.stringify(users));
        });
});

app.post('/api/users', (req, res) => {
    const userName = req.body.username;
    const user = new User({
        username: userName,
    })
        .save()
        .then((user) => {
            res.json(user);
        });
});

let current_date = new Date();

app.post('/api/users/:_id/exercises', (req, res) => {
    const id = req.params._id;
    const desc = req.body.description;
    const dur = req.body.duration;
    const date = req.body.date;
    User.findById(id).then((user) => {
        const excer = new userExcercise({
            userId: id,
            username: user.username,
            decsription: desc,
            duration: dur,
            date: date || current_date,
        })
            .save()
            .then((excer) => {
                res.json({
                    username: excer.username,
                    description: excer.decsription,
                    duration: excer.duration,
                    date: excer.date.toDateString(),
                    _id: excer.userId,
                });
            });
    });
});

app.get('/api/users/:_id/logs', (req, res) => {
    const id = req.params._id;
    const from = req.query.from || '1970-01-01';
    const to = req.query.to || '2050-12-12';
    let limit = req.query.limit;
    const isDateInRage = (startDate, endDate) => {
        const startTimeStamp = new Date(startDate).getTime();
        const endTimeStamp = new Date(endDate).getTime();

        return (dateToCheck) => {
            const toCheckTimeStamp = new Date(dateToCheck).getTime();
            return (
                toCheckTimeStamp > startTimeStamp &&
                toCheckTimeStamp < endTimeStamp
            );
        };
    };
    const isInRangeOne = isDateInRage(from, to);
    const logs = userExcercise
        .find({ userId: id })
        .lean()
        .exec((err, users) => {
            console.log(from, to);
            const newUserDate = users.map((user) => {
                console.log(isInRangeOne(user.date));
                if (isInRangeOne(user.date)) {
                    return user;
                }
            });
            console.log(newUserDate);
            if (!limit || limit > users.length) {
                limit = users.length;
            }
            console.log(limit);
            const newUsers = newUserDate.slice(limit - 1);
            console.log(newUsers);
            const userName = newUsers.map((item) => {
                return item.username;
            });
            return res.json({
                username: String(userName[0]),
                count: users.length,
                _id: id,
                log: newUsers.map((item) => {
                    return {
                        description: item.decsription,
                        duration: item.duration,
                        date: String(item.date.toDateString()),
                    };
                }),
            });
        });
});

mongoose.connect(process.env.MONGO_URI).then((result) => {
    const listener = app.listen(process.env.PORT || 3000, () => {
        console.log('Your app is listening on port ' + listener.address().port);
    });
});
