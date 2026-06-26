import { EmailService } from './src/services/email.service';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  try {
    await EmailService.sendForgotPasswordEmail('Test User', 'sarmahk831@gmail.com', '123456');
    console.log('Email sent successfully!');
  } catch (err) {
    console.error('Email failed:', err);
  }
}

testEmail();
