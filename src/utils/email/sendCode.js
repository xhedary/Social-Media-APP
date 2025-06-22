import nodemailer from "nodemailer"
export const sendMail = async ({
    to = [],
    cc = [],
    bcc = [],
    subject = "",
    text = "",
    html = "",
    attachments = [],
} = {}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });


    const info = await transporter.sendMail({
        from: `"Route 👻" <${process.env.EMAIL}>`,
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        attachments,
    });
}
