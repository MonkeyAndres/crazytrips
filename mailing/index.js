const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const options = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: 'views/mailing',
        partialsDir : 'views/partials/'
    },
    viewPath: 'views/mailing',
    extName: '.hbs'
};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAILUSER,
        pass: process.env.GMAILPASS
    }
});

transporter.use('compile', hbs(options));

const sendMail = (user) => {
    let mail = {
        to: user.email,
        subject: 'Confirmate CrazyTrips Account!',
        template: 'index',
        context: {user}
    };
    return transporter.sendMail(mail)
}

const sendMailRequest = (user,trip) => {
    let mail = {
        to: user.email,
        subject: 'Someone has joined your trip!',
        template: 'index',
        context: {user,tripID:trip._id }
    };
    return transporter.sendMail(mail)
}

module.exports = {sendMail, sendMailRequest};