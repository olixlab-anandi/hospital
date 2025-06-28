import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "olixlab.50@gmail.com",
    pass: "lqto iwme fbib ohwk",
  },
});

interface mailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  path?: string | null;
  attechments?: string[];
}

const sendEmail = async ({
  from,
  to,
  subject,
  text,
  html,
  path = null,
}: mailOptions) => {
  const mailoptions: mailOptions = {
    from: from,
    to,
    subject: subject,
    text,
    html: html,
  };
  console.log(to);
  if (path) {
    mailoptions.attechments = [path];
  }

  await transporter.sendMail(mailoptions);
};

export { sendEmail };
